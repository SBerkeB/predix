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

// GET - Fetch a specific bet by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const data = readBetsData();
    
    const bet = data.bets.find(bet => bet.id === id);
    
    if (!bet) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(bet);
  } catch (error) {
    console.error('Error fetching bet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bet' },
      { status: 500 }
    );
  }
}

// PUT - Update a specific bet
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const data = readBetsData();
    
    const betIndex = data.bets.findIndex(bet => bet.id === id);
    
    if (betIndex === -1) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      );
    }

    // Update bet with new data (preserve certain fields)
    const updatedBet = {
      ...data.bets[betIndex],
      ...body,
      id: id, // Preserve ID
      createdAt: data.bets[betIndex].createdAt, // Preserve creation date
      votes: data.bets[betIndex].votes, // Preserve votes
      totalVotes: data.bets[betIndex].totalVotes, // Preserve total votes
    };

    data.bets[betIndex] = updatedBet;
    data.metadata.lastUpdated = new Date().toISOString();

    // Save to file
    const success = writeBetsData(data);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update bet' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedBet);
  } catch (error) {
    console.error('Error updating bet:', error);
    return NextResponse.json(
      { error: 'Failed to update bet' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific bet
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const data = readBetsData();
    
    const betIndex = data.bets.findIndex(bet => bet.id === id);
    
    if (betIndex === -1) {
      return NextResponse.json(
        { error: 'Bet not found' },
        { status: 404 }
      );
    }

    // Remove bet from array
    const deletedBet = data.bets.splice(betIndex, 1)[0];
    
    // Update metadata
    data.metadata.totalBets = data.bets.length;
    data.metadata.totalVotes = data.bets.reduce((total, bet) => total + bet.totalVotes, 0);
    data.metadata.lastUpdated = new Date().toISOString();

    // Save to file
    const success = writeBetsData(data);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete bet' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Bet deleted successfully',
      deletedBet: deletedBet
    });
  } catch (error) {
    console.error('Error deleting bet:', error);
    return NextResponse.json(
      { error: 'Failed to delete bet' },
      { status: 500 }
    );
  }
}