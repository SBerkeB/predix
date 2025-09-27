import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'bets.json');

// Helper function to read data from JSON file
function readBetsData() {
  try {
    const fileContents = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading bets data:', error);
    return { bets: [], categories: [], metadata: { totalBets: 0, totalVotes: 0 } };
  }
}

// Helper function to write data to JSON file
function writeBetsData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing bets data:', error);
    return false;
  }
}

// POST - Vote on a bet
export async function POST(request) {
  try {
    const body = await request.json();
    const { betId, voteType } = body;

    // Validation
    if (!betId || !voteType) {
      return NextResponse.json(
        { error: 'Missing required fields: betId, voteType' },
        { status: 400 }
      );
    }

    if (voteType !== 'yes' && voteType !== 'no') {
      return NextResponse.json(
        { error: 'Invalid vote type. Must be "yes" or "no"' },
        { status: 400 }
      );
    }

    const data = readBetsData();
    
    // Find the bet
    const betIndex = data.bets.findIndex(bet => bet.id === betId);
    
    if (betIndex === -1) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      );
    }

    const bet = data.bets[betIndex];

    // Check if bet is still active
    if (bet.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot vote on inactive bet' },
        { status: 400 }
      );
    }

    // Check if bet has expired
    if (new Date() > new Date(bet.expiresAt)) {
      return NextResponse.json(
        { error: 'Cannot vote on expired bet' },
        { status: 400 }
      );
    }

    // Update vote count
    if (voteType === 'yes') {
      bet.votes.yes += 1;
    } else {
      bet.votes.no += 1;
    }

    // Update total votes
    bet.totalVotes = bet.votes.yes + bet.votes.no;

    // Update the bet in the array
    data.bets[betIndex] = bet;

    // Update metadata
    data.metadata.totalVotes = data.bets.reduce((total, b) => total + b.totalVotes, 0);
    data.metadata.lastUpdated = new Date().toISOString();

    // Save to file
    const success = writeBetsData(data);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save vote' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Vote recorded successfully',
      bet: bet,
      voteType: voteType
    });
  } catch (error) {
    console.error('Error recording vote:', error);
    return NextResponse.json(
      { error: 'Failed to record vote' },
      { status: 500 }
    );
  }
}