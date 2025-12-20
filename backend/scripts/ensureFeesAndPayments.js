const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const connectDB = require('../config/db');
const Committee = require('../models/Committee');
const Member = require('../models/Member');
const Payment = require('../models/Payment');

const ensureFeesAndPayments = async () => {
    try {
        await connectDB();
        console.log('🚀 Starting Fees and Payments Check...');

        // 1. Update Club Fees (Default to 500 if 0 or missing)
        const clubs = await Committee.find({});
        for (const club of clubs) {
            if (!club.fee || club.fee === 0) {
                club.fee = 500; // Default fee
                await club.save();
                console.log(`✅ Updated fee for "${club.name}" to ₹500`);
            }
        }

        // 2. Backfill Missing Payments
        const members = await Member.find({ isDeleted: false });

        for (const member of members) {
            // Get member's committees
            // member.committees is array of IDs
            const committees = await Committee.find({ _id: { $in: member.committees } });

            for (const committee of committees) {
                if (committee.fee > 0) {
                    // Check if payment exists
                    const exists = await Payment.findOne({
                        member: member._id,
                        club: committee.name, // or match by club ID if schema changed, but currently using name String
                        type: 'dues'
                    });

                    if (!exists) {
                        // Create Payment
                        await Payment.create({
                            member: member._id,
                            amount: committee.fee,
                            type: 'dues',
                            status: 'pending',
                            club: committee.name,
                            notes: `Membership fee for ${committee.name} (Backfilled)`,
                            date: new Date()
                        });
                        console.log(`➕ Created missing payment for ${member.name} in ${committee.name}`);

                        // Update Member Fees Due
                        // We increase it by the fee amount. 
                        // Note: If the user previously manually updated feesDue, this might double count.
                        // But since we found NO payment, it's safer to add it.
                        member.feesDue = (member.feesDue || 0) + committee.fee;
                        await member.save();
                    }
                }
            }
        }

        console.log('✨ Done ensuring fees and payments.');
        process.exit(0);

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

ensureFeesAndPayments();
