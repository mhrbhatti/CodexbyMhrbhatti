const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MCQ = require('./models/MCQ');
const User = require('./models/User');
const data = require('./class9_converted.json');

dotenv.config();

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mcq_platform');
    console.log('Connected to MongoDB');

    // Remove existing Class 9 MCQs only
    const deleted = await MCQ.deleteMany({ class: '9' });
    console.log(`Removed ${deleted.deletedCount} existing Class 9 MCQs`);

    // Insert converted MCQs
    const inserted = await MCQ.insertMany(data);
    console.log(`Inserted ${inserted.length} Class 9 MCQs`);

    // Breakdown
    const chapters = [...new Set(data.map(d => d.chapterNo))].sort((a,b)=>a-b);
    chapters.forEach(ch => {
      const count = data.filter(d => d.chapterNo === ch).length;
      const name = data.find(d => d.chapterNo === ch).chapterName;
      console.log(`  Chapter ${ch} - ${name}: ${count} MCQs`);
    });

    // Demo user
    await User.deleteMany({ email: 'demo@student.com' });
    await User.create({
      name: 'Demo Student',
      email: 'demo@student.com',
      password: 'demo1234',
      enrolledClass: '9'
    });
    console.log('\nDemo account: demo@student.com / demo1234');
    console.log('\nSeeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

seed();