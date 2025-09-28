import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper function to read data
function readData() {
  const dataPath = path.join(process.cwd(), 'data', 'predictions.json');
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
}

// Helper function to write data
function writeData(data) {
  const dataPath = path.join(process.cwd(), 'data', 'predictions.json');
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// GET - Fetch all predictions
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit');
    
    const data = readData();
    let predictions = data.predictions || [];
    
    // Apply filters
    if (category && category !== 'all') {
      predictions = predictions.filter(prediction => prediction.category.toLowerCase() === category.toLowerCase());
    }
    
    if (status) {
      predictions = predictions.filter(prediction => prediction.status === status);
    }
    
    if (search) {
      const searchTerm = search.toLowerCase();
      predictions = predictions.filter(prediction =>
        prediction.title.toLowerCase().includes(searchTerm) ||
        prediction.description.toLowerCase().includes(searchTerm) ||
        prediction.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    if (limit) {
      predictions = predictions.slice(0, parseInt(limit));
    }
    
    return NextResponse.json(predictions);
  } catch (error) {
    console.error('Error fetching predictions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch predictions' },
      { status: 500 }
    );
  }
}

// POST - Create a new prediction
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description, category, expiresAt, tags, createdBy } = body;
    
    // Validate required fields
    if (!title || !description || !category || !expiresAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const data = readData();
    
    // Create new prediction object
    const newPrediction = {
      id: Date.now().toString(),
      title,
      description,
      category,
      expiresAt,
      tags: tags || [],
      createdBy: createdBy || 'Anonymous',
      createdAt: new Date().toISOString(),
      status: 'active',
      votes: {
        yes: 0,
        no: 0
      },
      totalVotes: 0
    };
    
    // Add to predictions array
    data.predictions = data.predictions || [];
    data.predictions.push(newPrediction);
    
    // Update metadata
    data.metadata = data.metadata || {};
    data.metadata.totalPredictions = data.predictions.length;
    data.metadata.lastUpdated = new Date().toISOString();
    
    // Save data
    writeData(data);
    
    return NextResponse.json(newPrediction, { status: 201 });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return NextResponse.json(
        { error: 'Failed to save prediction' },
        { status: 500 }
      );
    }
    
    console.error('Error creating prediction:', error);
    return NextResponse.json(
      { error: 'Failed to create prediction' },
      { status: 500 }
    );
  }
}