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

// GET - Fetch all bets
export async function GET(request) {
  try {
    const data = readBetsData();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');

    let bets = data.bets || [];

    // Filter by category if specified
    if (category && category !== 'all') {
      bets = bets.filter(bet => bet.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by status if specified
    if (status && status !== 'all') {
      bets = bets.filter(bet => bet.status === status);
    }

    // Limit results if specified
    if (limit) {
      bets = bets.slice(0, parseInt(limit));
    }

    // Sort by creation date (newest first)
    bets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json(bets);
  } catch (error) {
    console.error('Error fetching bets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bets' },
      { status: 500 }
    );
  }
}

// POST - Create a new bet
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, category, expiresAt, tags, createdBy } = body;

    // Validation
    if (!title || !description || !category || !expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category, expiresAt' },
        { status: 400 }
      );
    }

    const data = readBetsData();
    
    // Generate new ID
    const newId = (data.bets.length + 1).toString();
    
    // Create new bet object
    const newBet = {
      id: newId,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      createdBy: createdBy || 'Anonymous',
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt,
      status: 'active',
      votes: {
        yes: 0,
        no: 0
      },
      totalVotes: 0,
      tags: tags || [],
      image: null
    };

    // Add to bets array
    data.bets.push(newBet);
    
    // Update metadata
    data.metadata.totalBets = data.bets.length;
    data.metadata.lastUpdated = new Date().toISOString();

    // Save to file
    const success = writeBetsData(data);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to save bet' },
        { status: 500 }
      );
    }

    return NextResponse.json(newBet, { status: 201 });
  } catch (error) {
    console.error('Error creating bet:', error);
    return NextResponse.json(
      { error: 'Failed to create bet' },
      { status: 500 }
    );
  }
}