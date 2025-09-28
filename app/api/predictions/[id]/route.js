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

// GET - Fetch a specific prediction by ID
export async function GET(request, { params }) {
  try {
    const { id } = params;
    const data = readData();
    const prediction = data.predictions?.find(p => p.id === id);
    
    if (!prediction) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(prediction);
  } catch (error) {
    console.error('Error fetching prediction:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prediction' },
      { status: 500 }
    );
  }
}

// PUT - Update a specific prediction
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const data = readData();
    
    const predictionIndex = data.predictions?.findIndex(p => p.id === id);
    
    if (predictionIndex === -1) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }
    
    // Update the prediction
    data.predictions[predictionIndex] = {
      ...data.predictions[predictionIndex],
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    // Update metadata
    data.metadata = data.metadata || {};
    data.metadata.lastUpdated = new Date().toISOString();
    
    writeData(data);
    
    return NextResponse.json(data.predictions[predictionIndex]);
  } catch (error) {
    console.error('Error updating prediction:', error);
    return NextResponse.json(
      { error: 'Failed to update prediction' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific prediction
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const data = readData();
    
    const predictionIndex = data.predictions?.findIndex(p => p.id === id);
    
    if (predictionIndex === -1) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }
    
    // Remove the prediction
    const deletedPrediction = data.predictions.splice(predictionIndex, 1)[0];
    
    // Update metadata
    data.metadata = data.metadata || {};
    data.metadata.totalPredictions = data.predictions.length;
    data.metadata.lastUpdated = new Date().toISOString();
    
    writeData(data);
    
    return NextResponse.json(deletedPrediction);
  } catch (error) {
    console.error('Error deleting prediction:', error);
    return NextResponse.json(
      { error: 'Failed to delete prediction' },
      { status: 500 }
    );
  }
}