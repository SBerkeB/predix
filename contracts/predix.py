# predix.py — prediction market with 10-block rounds, oracle-priced, box-based state, atomic bet groups.
from pyteal import *

ROUND_LEN = 10
PRICE_KEY = Bytes("price")              # key in oracle's global state
G_ORACLE  = Bytes("oracle_app_id")      # this app's global: oracle app id

# ---- box name helpers ----
def round_box_name(r: Expr) -> Expr:
    return Concat(Bytes("r|"), Itob(r))  # per-round aggregate

def bet_box_name(r: Expr, addr: Expr) -> Expr:
    return Concat(Bytes("b|"), Itob(r), Bytes("|"), addr)  # per-user bet

# ---- packing helpers (all uint64 => 8 bytes) ----
# Round box = 48 bytes:
# [0:8]=start_price, [8:16]=end_price, [16:24]=total_up, [24:32]=total_down, [32:40]=resolved(0/1), [40:48]=outcome(0=tie,1=UP,2=DOWN)
# Round box = 56 bytes now:
# [0:8]=start_price, [8:16]=end_price, [16:24]=total_up, [24:32]=total_down,
# [32:40]=resolved, [40:48]=outcome, [48:56]=asa_id
def pack_round(start_p, end_p, tot_up, tot_dn, resolved, outcome, asa_id) -> Expr:
    return Concat(
        Itob(start_p), Itob(end_p), Itob(tot_up), Itob(tot_dn),
        Itob(resolved), Itob(outcome), Itob(asa_id)
    )

def r_start(v): return Extract(v, Int(0),  Int(8))
def r_end(v):   return Extract(v, Int(8),  Int(8))
def r_up(v):    return Extract(v, Int(16), Int(8))
def r_dn(v):    return Extract(v, Int(24), Int(8))
def r_res(v):   return Extract(v, Int(32), Int(8))
def r_out(v):   return Extract(v, Int(40), Int(8))
def r_asa(v):   return Extract(v, Int(48), Int(8))   # <-- new


# Bet box = 24 bytes:
# [0:8]=amount, [8:16]=side(1=UP,2=DOWN), [16:24]=claimed(0/1)
def pack_bet(amt: Expr, side: Expr, claimed: Expr) -> Expr:
    return Concat(Itob(amt), Itob(side), Itob(claimed))

def b_amt(v: Expr)     -> Expr: return Extract(v, Int(0),  Int(8))
def b_side(v: Expr)    -> Expr: return Extract(v, Int(8),  Int(8))
def b_claimed(v: Expr) -> Expr: return Extract(v, Int(16), Int(8))

# floor(Global.round() / ROUND_LEN)
def current_round() -> Expr:
    return Global.round() / Int(ROUND_LEN)

# ---- oracle read (requires oracle in foreign apps) ----
@Subroutine(TealType.uint64)
def read_oracle_price(oracle_id: Expr) -> Expr:
    mv = App.globalGetEx(oracle_id, PRICE_KEY)
    return Seq(
        mv,                         # none
        Assert(mv.hasValue()),
        mv.value()                  # returns uint64
    )

# ensure per-round aggregate box exists; if not, create with start_price
@Subroutine(TealType.none)
def ensure_round_init(oracle_id: Expr, r: Expr) -> Expr:
    name = ScratchVar(TealType.bytes)
    cur  = ScratchVar(TealType.bytes)
    sp   = ScratchVar(TealType.uint64)
    mv   = BoxGet(Bytes("dummy"))  # placeholder

    return Seq(
        name.store(round_box_name(r)),
        (mv := BoxGet(name.load())),
        If(Not(mv.hasValue())).Then(
            Seq(
                # get start price
                sp.store(read_oracle_price(oracle_id)),

                # create ASA
                InnerTxnBuilder.Begin(),
                InnerTxnBuilder.SetFields({
                    TxnField.type_enum: TxnType.AssetConfig,
                    TxnField.config_asset_total: Int(1000000000),  # arbitrary cap
                    TxnField.config_asset_decimals: Int(0),
                    TxnField.config_asset_unit_name: Bytes("RCPT"),
                    TxnField.config_asset_name: Concat(Bytes("RoundReceipt_"), Itob(r)),
                    TxnField.config_asset_manager: Global.current_application_address(),
                    TxnField.config_asset_reserve: Global.current_application_address(),
                    TxnField.config_asset_freeze: Global.current_application_address(),
                    TxnField.config_asset_clawback: Global.current_application_address(),
                }),
                InnerTxnBuilder.Submit(),
                (asa_id := ScratchVar()).store(InnerTxn.created_asset_id()),

                # pack new round state
                cur.store(pack_round(
                    sp.load(), Int(0), Int(0), Int(0),
                    Int(0), Int(0), asa_id.load()
                )),

                Pop(BoxCreate(name.load(), Len(cur.load()))),
                BoxPut(name.load(), cur.load())
            )
        )
    )



@Subroutine(TealType.bytes)
def load_round_box(r: Expr) -> Expr:
    name = round_box_name(r)
    mv = BoxGet(name)
    return Seq(
        mv,                         # none
        Assert(mv.hasValue()),
        mv.value()
    )

@Subroutine(TealType.none)
def save_round_box(r: Expr, v: Expr) -> Expr:
    return Seq(
        Assert(Len(v) == Int(48)),
        BoxPut(round_box_name(r), v)
    )

@Subroutine(TealType.none)
def record_bet(r: Expr, sender: Expr, amount: Expr, side: Expr) -> Expr:
    name = bet_box_name(r, sender)
    mv = BoxGet(name)
    return Seq(
        mv,
        Assert(Not(mv.hasValue())),             # no double-bet
        Pop(BoxCreate(name, Int(24))),
        BoxPut(name, pack_bet(amount, side, Int(0)))
    )

@Subroutine(TealType.none)
def mark_claimed(r: Expr, sender: Expr) -> Expr:
    name = bet_box_name(r, sender)
    mv = BoxGet(name)
    newv = ScratchVar(TealType.bytes)
    return Seq(
        mv,
        Assert(mv.hasValue()),
        Assert(Btoi(b_claimed(mv.value())) == Int(0)),
        newv.store(pack_bet(Btoi(b_amt(mv.value())), Btoi(b_side(mv.value())), Int(1))),
        BoxPut(name, newv.load())
    )

@Subroutine(TealType.none)
def pay_out(to: Expr, amt: Expr) -> Expr:
    return Seq(
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.Payment,
            TxnField.amount: amt,
            TxnField.receiver: to,
        }),
        InnerTxnBuilder.Submit()
    )
    
@Subroutine(TealType.none)
def issue_receipt(to: Expr, asset_id: Expr) -> Expr:
    return Seq(
        InnerTxnBuilder.Begin(),
        InnerTxnBuilder.SetFields({
            TxnField.type_enum: TxnType.AssetTransfer,
            TxnField.xfer_asset: asset_id,
            TxnField.asset_amount: Int(1),
            TxnField.asset_receiver: to,
        }),
        InnerTxnBuilder.Submit()
    )


def approval_program():
    op = Txn.application_args[0]

    # --- create (arg0 = oracle app id) ---
    on_create = Seq(
        Assert(Txn.application_args.length() == Int(1)),
        App.globalPut(G_ORACLE, Btoi(Txn.application_args[0])),
        Return(Int(1))
    )

    # --- bet (requires 2-txn group: [0]=Payment, [1]=this AppCall) ---
    def bet(side_val: Expr) -> Expr:
        r      = ScratchVar(TealType.uint64)
        rb     = ScratchVar(TealType.bytes)
        amt    = ScratchVar(TealType.uint64)
        new_rb = ScratchVar(TealType.bytes)
        oracle = ScratchVar(TealType.uint64)
        pay = Gtxn[Int(0)]   # enforce exact group order

        return Seq(
            Assert(Global.group_size() == Int(2)),
            Assert(Txn.group_index() == Int(1)),              # app call must be second
            Assert(pay.type_enum() == TxnType.Payment),
            Assert(pay.receiver() == Global.current_application_address()),
            Assert(pay.amount() > Int(0)),

            r.store(current_round()),
            oracle.store(App.globalGet(G_ORACLE)),

            # init round if first bet; also asserts oracle provided & valid when read
            ensure_round_init(oracle.load(), r.load()),

            rb.store(load_round_box(r.load())),
            amt.store(pay.amount()),

            new_rb.store(
                If(side_val == Int(1))
                .Then(
                    pack_round(
                        Btoi(r_start(rb.load())),
                        Btoi(r_end(rb.load())),
                        Btoi(r_up(rb.load())) + amt.load(),
                        Btoi(r_dn(rb.load())),
                        Btoi(r_res(rb.load())),
                        Btoi(r_out(rb.load())),
                        Btoi(r_asa(rb.load()))        # <--- add this
                    )
                )
                .Else(
                    pack_round(
                        Btoi(r_start(rb.load())),
                        Btoi(r_end(rb.load())),
                        Btoi(r_up(rb.load())),
                        Btoi(r_dn(rb.load())) + amt.load(),
                        Btoi(r_res(rb.load())),
                        Btoi(r_out(rb.load())),
                        Btoi(r_asa(rb.load()))        # <--- add this
                    )
                )
            ),
            save_round_box(r.load(), new_rb.load()),
            # record user bet
            record_bet(r.load(), Txn.sender(), amt.load(), side_val),

            # issue 1 receipt for this round
            issue_receipt(Txn.sender(), Btoi(r_asa(rb.load()))),
            Return(Int(1))
        )

    on_bet_up = Seq(
        Assert(Txn.application_args.length() == Int(1)),  # ["bet_up"]
        bet(Int(1))
    )

    on_bet_down = Seq(
        Assert(Txn.application_args.length() == Int(1)),  # ["bet_down"]
        bet(Int(2))
    )

    # --- resolve (["resolve","latest"] or ["resolve", int:round]) ---
    arg1 = ScratchVar(TealType.bytes)
    rsvd_r = ScratchVar(TealType.uint64)
    rb = ScratchVar(TealType.bytes)
    oracle = ScratchVar(TealType.uint64)
    endp = ScratchVar(TealType.uint64)
    startp = ScratchVar(TealType.uint64)
    outc = ScratchVar(TealType.uint64)
    new_rb = ScratchVar(TealType.bytes)

    on_resolve = Seq(
        Assert(Txn.application_args.length() == Int(2)),
        arg1.store(Txn.application_args[1]),
        rsvd_r.store(
            If(arg1.load() == Bytes("latest"))
            .Then(If(current_round() == Int(0)).Then(Int(0)).Else(current_round() - Int(1)))
            .Else(Btoi(arg1.load()))
        ),
        rb.store(load_round_box(rsvd_r.load())),
        Assert(Btoi(r_res(rb.load())) == Int(0)),

        oracle.store(App.globalGet(G_ORACLE)),
        endp.store(read_oracle_price(oracle.load())),
        startp.store(Btoi(r_start(rb.load()))),

        outc.store(
            If(endp.load() > startp.load()).Then(Int(1))     # UP
            .ElseIf(endp.load() < startp.load()).Then(Int(2))# DOWN
            .Else(Int(0))                                    # tie
        ),
        new_rb.store(pack_round(
            startp.load(), endp.load(),
            Btoi(r_up(rb.load())), Btoi(r_dn(rb.load())),  Btoi(r_asa(rb.load())),
            Int(1), outc.load()
        )),
        save_round_box(rsvd_r.load(), new_rb.load()),
        Return(Int(1))
    )

    # --- claim (["claim", int:round]) ---
    # --- CLAIM (["claim", int:round]) ---
    cl_r      = ScratchVar(TealType.uint64)
    cl_rb     = ScratchVar(TealType.bytes)
    bet_name  = ScratchVar(TealType.bytes)
    bet_val   = ScratchVar(TealType.bytes)

    user_amt  = ScratchVar(TealType.uint64)
    user_side = ScratchVar(TealType.uint64)
    tot_up    = ScratchVar(TealType.uint64)
    tot_dn    = ScratchVar(TealType.uint64)
    cl_outc   = ScratchVar(TealType.uint64)
    pool      = ScratchVar(TealType.uint64)
    win_total = ScratchVar(TealType.uint64)
    payout    = ScratchVar(TealType.uint64)

    on_claim = Seq(
        Assert(Txn.application_args.length() == Int(2)),

        cl_r.store(Btoi(Txn.application_args[1])),
        cl_rb.store(load_round_box(cl_r.load())),
        Assert(Btoi(r_res(cl_rb.load())) == Int(1)),
        cl_outc.store(Btoi(r_out(cl_rb.load()))),
        tot_up.store(Btoi(r_up(cl_rb.load()))),
        tot_dn.store(Btoi(r_dn(cl_rb.load()))),

        # load user's bet box
        bet_name.store(bet_box_name(cl_r.load(), Txn.sender())),
        (mv_bet := BoxGet(bet_name.load())),   # mv_bet is a MaybeValue(bytes)
        mv_bet,
        Assert(mv_bet.hasValue()),
        bet_val.store(mv_bet.value()),

        # check not already claimed
        Assert(Btoi(b_claimed(bet_val.load())) == Int(0)),
        user_amt.store(Btoi(b_amt(bet_val.load()))),
        user_side.store(Btoi(b_side(bet_val.load()))),

        # pool + winner totals
        pool.store(tot_up.load() + tot_dn.load()),
        win_total.store(
            If(cl_outc.load() == Int(1)).Then(tot_up.load())
            .ElseIf(cl_outc.load() == Int(2)).Then(tot_dn.load())
            .Else(Int(0))
        ),

        payout.store(
            If(cl_outc.load() == Int(0))
            .Then(user_amt.load())
            .ElseIf(user_side.load() != cl_outc.load())
            .Then(Int(0))
            .Else(WideRatio([user_amt.load(), pool.load()], [win_total.load()]))
        ),

        mark_claimed(cl_r.load(), Txn.sender()),
        If(payout.load() > Int(0)).Then(pay_out(Txn.sender(), payout.load())),

        Return(Int(1))
    )


    return Cond(
        [Txn.application_id() == Int(0), on_create],
        [Txn.on_completion() == OnComplete.NoOp, Cond(
            [op == Bytes("bet_up"), on_bet_up],
            [op == Bytes("bet_down"), on_bet_down],
            [op == Bytes("resolve"), on_resolve],
            [op == Bytes("claim"), on_claim],
        )]
    )

def clear_state_program():
    return Return(Int(1))

if __name__ == "__main__":
    with open("predix_approval.teal", "w") as f:
        f.write(compileTeal(approval_program(), mode=Mode.Application, version=8))
    with open("predix_clear.teal", "w") as f:
        f.write(compileTeal(clear_state_program(), mode=Mode.Application, version=8))
