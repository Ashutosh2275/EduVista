import { connectDB, disconnectDB } from '../src/config';
import { User } from '../src/models';
import { hashPassword } from '../src/utils/passwordUtils';

async function resetStudentPassword(): Promise<void> {
  await connectDB();
  const user = await User.findOne({ email: 'student@eduvista.com' });
  if (!user) {
    console.error('Student account not found: student@eduvista.com');
    process.exit(1);
  }
  user.password = await hashPassword('Student@123');
  await user.save();
  console.log('Student password restored to Student@123');
  await disconnectDB();
}

resetStudentPassword().catch((err) => {
  console.error(err);
  process.exit(1);
});
