//This script verifies role-based data access by simulating admin 
//and non-admin requests to ensure sensitive member fields are hidden from regular users and visible to admins.
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Member = require('../models/Member');
const User = require('../models/User');
const { listMembers, getMember } = require('../controllers/memberController');

// Load environment variables
dotenv.config();

const runVerification = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        // Create mock req/res/next
        const mockRes = () => {
            const res = {};
            res.json = (data) => { res.data = data; return res; };
            res.status = (code) => { res.statusCode = code; return res; };
            return res;
        };
        const next = (err) => { if (err) console.error('Error:', err); };

        // 1. Create a test member if none exists
        let member = await Member.findOne();
        if (!member) {
            member = await Member.create({
                name: 'Test Member',
                email: 'test@example.com',
                feesDue: 100,
                address: '123 Test St'
            });
            console.log('Created test member');
        } else {
            // Ensure member has feesDue and address for testing
            member.feesDue = 100;
            member.address = '123 Test St';
            await member.save();
            console.log('Updated existing member for testing');
        }

        // 2. Test as Non-Admin
        console.log('\n--- Testing as Non-Admin ---');
        const nonAdminReq = {
            query: {},
            params: { id: member._id },
            user: { role: 'member' }
        };

        // Test listMembers
        const resListNonAdmin = mockRes();
        await listMembers(nonAdminReq, resListNonAdmin, next);
        const firstMemberNonAdmin = resListNonAdmin.data.members[0];

        if (firstMemberNonAdmin.feesDue === undefined && firstMemberNonAdmin.address === undefined) {
            console.log('✅ listMembers: feesDue and address are HIDDEN for non-admin');
        } else {
            console.error('❌ listMembers: FAILED - Data leaked for non-admin', firstMemberNonAdmin);
        }

        // Test getMember
        const resGetNonAdmin = mockRes();
        await getMember(nonAdminReq, resGetNonAdmin, next);
        const singleMemberNonAdmin = resGetNonAdmin.data.member;

        if (singleMemberNonAdmin.feesDue === undefined && singleMemberNonAdmin.address === undefined) {
            console.log('✅ getMember: feesDue and address are HIDDEN for non-admin');
        } else {
            console.error('❌ getMember: FAILED - Data leaked for non-admin', singleMemberNonAdmin);
        }

        // 3. Test as Admin
        console.log('\n--- Testing as Admin ---');
        const adminReq = {
            query: {},
            params: { id: member._id },
            user: { role: 'admin' }
        };

        // Test listMembers
        const resListAdmin = mockRes();
        await listMembers(adminReq, resListAdmin, next);
        const firstMemberAdmin = resListAdmin.data.members.find(m => m._id.toString() === member._id.toString());

        if (firstMemberAdmin.feesDue !== undefined && firstMemberAdmin.address !== undefined) {
            console.log('✅ listMembers: feesDue and address are VISIBLE for admin');
        } else {
            console.error('❌ listMembers: FAILED - Data missing for admin', firstMemberAdmin);
        }

        // Test getMember
        const resGetAdmin = mockRes();
        await getMember(adminReq, resGetAdmin, next);
        const singleMemberAdmin = resGetAdmin.data.member;

        if (singleMemberAdmin.feesDue !== undefined && singleMemberAdmin.address !== undefined) {
            console.log('✅ getMember: feesDue and address are VISIBLE for admin');
        } else {
            console.error('❌ getMember: FAILED - Data missing for admin', singleMemberAdmin);
        }

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
        process.exit();
    }
};

runVerification();
