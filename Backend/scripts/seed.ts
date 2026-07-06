import { connectDB, disconnectDB } from '../src/config';
import { User, College, Course, Enquiry, SystemSettings } from '../src/models';
import { hashPassword } from '../src/utils/passwordUtils';
import { ROLES } from '../src/constants/roles';
import { CONTACT_INFO } from '../src/constants/contactInfo';
import { COLLEGE_SEEDS, COURSE_INPUTS } from './seedData';

async function seed(): Promise<void> {
  console.log('🌱 Starting EduVista database seed...');

  try {
    await connectDB();

    console.log('🧹 Cleaning collections...');
    await Promise.all([
      User.deleteMany({}),
      College.deleteMany({}),
      Course.deleteMany({}),
      Enquiry.deleteMany({}),
    ]);

    // ── Users ──────────────────────────────────────────────────
    const adminPassword = await hashPassword('Admin@123');
    await User.create({
      name: 'EduVista Admin',
      email: 'admin@eduvista.com',
      password: adminPassword,
      role: ROLES.ADMIN,
      phone: '9876543210',
      isActive: true,
      preferences: {
        interestedFields: ['engineering'],
        preferredLocations: ['Delhi'],
        budgetRange: { min: 0, max: 5000000 },
        notifications: true,
      },
    });

    const studentPassword = await hashPassword('Student@123');
    await User.create({
      name: 'EduVista Student',
      email: 'student@eduvista.com',
      password: studentPassword,
      role: ROLES.USER,
      phone: '9123456780',
      isActive: true,
      field: 'engineering',
      city: 'Delhi',
      state: 'Delhi',
      preferences: {
        interestedFields: ['engineering', 'management'],
        preferredLocations: ['Delhi', 'Mumbai', 'Bangalore'],
        budgetRange: { min: 0, max: 2000000 },
        notifications: true,
      },
    });

    console.log('✅ Users: 2 (admin@eduvista.com / student@eduvista.com)');

    // ── Colleges ─────────────────────────────────────────────
    const colleges = await College.insertMany(
      COLLEGE_SEEDS.map((c) => ({ ...c, coursesOffered: [] }))
    );
    const collegeBySlug = Object.fromEntries(colleges.map((c) => [c.slug, c]));
    const collegesByCategory = colleges.reduce<Record<string, typeof colleges>>((acc, c) => {
      (acc[c.category] ??= []).push(c);
      return acc;
    }, {});

    console.log(`✅ Colleges: ${colleges.length} published across ${Object.keys(collegesByCategory).length} categories`);

    // ── Courses ──────────────────────────────────────────────
    const courseDocs = COURSE_INPUTS.map((course) => {
      const offering = course.categories.flatMap((cat) => collegesByCategory[cat] ?? []).slice(0, 4);
      return {
        name: course.name,
        slug: course.slug,
        shortDescription: `Explore ${course.name} — duration ${course.duration}, ${course.degreeLevel} level.`,
        fullDescription: `${course.name} prepares students for careers in ${course.specialization.join(', ')} through rigorous academics and industry exposure.`,
        degreeLevel: course.degreeLevel,
        stream: course.stream,
        specialization: course.specialization,
        duration: course.duration,
        mode: 'full-time' as const,
        language: 'English',
        academics: {
          eligibility: 'See college-specific admission criteria and entrance exam requirements.',
          entranceExams: course.stream === 'engineering' ? ['JEE Main', 'JEE Advanced'] : ['CUET', 'Institute Entrance'],
          minimumQualification: course.degreeLevel === 'UG' ? '10+2 or equivalent' : "Bachelor's degree",
        },
        fees: { tuitionFees: course.tuitionFees, hostelFees: Math.round(course.tuitionFees * 0.15), otherCharges: 15000 },
        placement: {
          averagePackage: Math.round(course.tuitionFees * 2.5),
          highestPackage: Math.round(course.tuitionFees * 8),
          placementRate: 75 + (course.tuitionFees % 20),
        },
        rating: 4.2 + (course.tuitionFees % 7) / 10,
        reviewCount: 300 + course.tuitionFees % 500,
        collegesOffering: offering.map((c) => c._id),
        numberOfCollegesOffering: offering.length,
        seo: {
          metaTitle: `${course.name} | EduVista`,
          metaDescription: `Find ${course.name} at top colleges — fees, eligibility, and placements.`,
        },
        status: 'published' as const,
        isFeatured: course.isFeatured ?? false,
        isTrending: course.isTrending ?? false,
      };
    });

    const courses = await Course.insertMany(courseDocs);
    const courseBySlug = Object.fromEntries(courses.map((c) => [c.slug, c]));

    console.log(`✅ Courses: ${courses.length} published`);

    // ── Link colleges ↔ courses ──────────────────────────────
    for (const college of colleges) {
      const linkedCourses = courses.filter((course) =>
        course.collegesOffering.some((id) => id.equals(college._id))
      );
      await College.updateOne(
        { _id: college._id },
        { $set: { coursesOffered: linkedCourses.map((c) => c._id) } }
      );
    }

    console.log('✅ College–course relationships linked');

    // ── Sample enquiries ─────────────────────────────────────
    const enquirySamples = [
      { name: 'Rahul Sharma', email: 'rahul.demo@example.com', phone: '9876543211', interestedCourse: 'B.Tech CSE', college: collegeBySlug['iit-delhi']?._id, message: 'Interested in admission process and cutoff for CSE.', status: 'new' as const },
      { name: 'Priya Singh', email: 'priya.demo@example.com', phone: '9876543212', interestedCourse: 'MBBS', college: collegeBySlug['aiims-delhi']?._id, message: 'Need information about NEET cutoff and hostel facilities.', status: 'contacted' as const },
      { name: 'Amit Patel', email: 'amit.demo@example.com', phone: '9876543213', interestedCourse: 'MBA', college: collegeBySlug['iim-ahmedabad']?._id, message: 'Query about CAT percentile and placement statistics.', status: 'new' as const },
      { name: 'Sneha Reddy', email: 'sneha.demo@example.com', phone: '9876543214', interestedCourse: 'LLB', college: collegeBySlug['nlsiu-bangalore']?._id, message: 'Request for CLAT preparation guidance and fee structure.', status: 'in-progress' as const },
      { name: 'Vikram Joshi', email: 'vikram.demo@example.com', phone: '9876543215', interestedCourse: 'B.Des', college: collegeBySlug['nid-ahmedabad']?._id, message: 'Portfolio requirements for design admission.', status: 'new' as const },
    ];

    await Enquiry.insertMany(enquirySamples);
    console.log(`✅ Enquiries: ${enquirySamples.length} sample records`);

    // ── System settings (contact info source of truth) ───────
    await SystemSettings.findOneAndUpdate(
      { key: 'platform_settings' },
      {
        $set: {
          contact: {
            supportEmail: CONTACT_INFO.email,
            supportPhone: CONTACT_INFO.phone,
            address: CONTACT_INFO.location,
          },
        },
      },
      { upsert: true, new: true }
    );
    console.log('✅ System settings: contact info synced');

    // ── Summary ──────────────────────────────────────────────
    const categoryCounts = COLLEGE_SEEDS.reduce<Record<string, number>>((acc, c) => {
      acc[c.category] = (acc[c.category] ?? 0) + 1;
      return acc;
    }, {});

    console.log('\n📊 Seed Summary');
    console.log(`   Colleges: ${colleges.length}`);
    Object.entries(categoryCounts).forEach(([cat, count]) => console.log(`     • ${cat}: ${count}`));
    console.log(`   Courses: ${courses.length}`);
    console.log(`   Users: 2`);
    console.log(`   Enquiries: ${enquirySamples.length}`);
    console.log(`   Featured colleges: ${colleges.filter((c) => c.isFeatured).length}`);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
    console.log('🌱 Seeding process finished.');
  }
}

seed();
