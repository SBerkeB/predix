from pyteal import *

def approval_program():
    # Key for oracle price
    price_key = Bytes("price")

    # On create: initialize price = 1000
    on_create = Seq([
        App.globalPut(price_key, Int(1000)),
        Return(Int(1))
    ])

    # On call: expect 1 argument, set as new price
    on_update_price = Seq([
        Assert(Txn.application_args.length() == Int(1)),
        App.globalPut(price_key, Btoi(Txn.application_args[0])),
        Return(Int(1))
    ])

    program = Cond(
        [Txn.application_id() == Int(0), on_create],    # create
        [Txn.on_completion() == OnComplete.NoOp, on_update_price]  # update price
    )

    return program


def clear_state_program():
    # Always succeed
    return Return(Int(1))


if __name__ == "__main__":
    approval = approval_program()
    clear = clear_state_program()

    compiled_approval = compileTeal(approval, mode=Mode.Application, version=6)
    compiled_clear = compileTeal(clear, mode=Mode.Application, version=6)

    with open("mock_oracle_approval.teal", "w") as f:
        f.write(compiled_approval)

    with open("mock_oracle_clear.teal", "w") as f:
        f.write(compiled_clear)
