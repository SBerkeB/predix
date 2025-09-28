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

// Helper function to read user votes
function readUserVotes() {
  try {
    const votesPath = path.join(process.cwd(), 'data', 'userVotes.json');
    const data = fs.readFileSync(votesPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {};
  }
}

// Helper function to write user votes
function writeUserVotes(votes) {
  const votesPath = path.join(process.cwd(), 'data', 'userVotes.json');
  fs.writeFileSync(votesPath, JSON.stringify(votes, null, 2));
}

// POST - Vote on a prediction
export async function POST(request) {
  try {
    const body = await request.json();
    const { predictionId, voteType, userId } = body;
    
    // Generate a simple userId if not provided (for demo purposes)
    const actualUserId = userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Validate input
    if (!predictionId || !voteType) {
      return NextResponse.json(
        { error: 'Missing required fields: predictionId, voteType' },
        { status: 400 }
      );
    }
    
    const data = readData();
    const userVotes = readUserVotes();
    
    // Find the prediction
    const predictionIndex = data.predictions?.findIndex(p => p.id === predictionId);
    
    if (predictionIndex === -1) {
      return NextResponse.json(
        { error: 'Prediction not found' },
        { status: 404 }
      );
    }
    
    const prediction = data.predictions[predictionIndex];
    
    // Check if prediction is still active
    if (prediction.status !== 'active') {
      return NextResponse.json(
        { error: 'Cannot vote on inactive prediction' },
        { status: 400 }
      );
    }
    
    // Validate vote type based on prediction structure
    const validVoteTypes = Object.keys(prediction.votes);
    if (!validVoteTypes.includes(voteType)) {
      return NextResponse.json(
        { error: `Invalid vote type. Valid options: ${validVoteTypes.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Check if user has already voted
    const userVoteKey = `${actualUserId}_${predictionId}`;
    const existingVote = userVotes[userVoteKey];
    
    if (existingVote) {
      // User is changing their vote
      if (existingVote === voteType) {
        return NextResponse.json(
          { error: 'You have already voted this way' },
          { status: 400 }
        );
      }
      
      // Remove old vote and add new vote
      prediction.votes[existingVote]--;
      prediction.votes[voteType]++;
      userVotes[userVoteKey] = voteType;
    } else {
      // New vote
      prediction.votes[voteType]++;
      prediction.totalVotes++;
      userVotes[userVoteKey] = voteType;
    }
    
    // Update metadata
    data.metadata = data.metadata || {};
    data.metadata.lastUpdated = new Date().toISOString();
    
    // Save data
    writeData(data);
    writeUserVotes(userVotes);
    
    return NextResponse.json({
      success: true,
      prediction: prediction,
      userVote: voteType
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    );
  }
}