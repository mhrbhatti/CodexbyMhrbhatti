require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  await User.deleteMany({ email: 'demo@student.com' });
  await User.create({ name: 'Demo Student', email: 'demo@student.com', password: 'demo1234', enrolledClass: '9' });
  await User.deleteMany({ email: 'admin@mcq.com' });
  await User.create({ name: 'Admin', email: 'admin@mcq.com', password: 'admin1234', isAdmin: true });
  console.log('Accounts created successfully');
  process.exit(0);
}).catch(err => {
  console.log('Error:', err.message);
  process.exit(1);
});
