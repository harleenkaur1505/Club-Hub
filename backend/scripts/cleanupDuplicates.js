// scripts/cleanupDuplicates.js
//This script identifies duplicate member profiles using email, merges their payments, committees, 
//and dues into a single primary profile, and removes redundant records to maintain data integrity.
require('dotenv').config();
const mongoose = require('mongoose');
const Member = require('../models/Member');
const Payment = require('../models/Payment');
const connectDB = require('../config/db');

async function cleanup() {
  await connectDB();
  console.log('Searching for duplicates...');

  const members = await Member.find({ isDeleted: false });
  const emailGroups = {};

  members.forEach(m => {
    if (!m.email) return;
    const email = m.email.toLowerCase().trim();
    if (!emailGroups[email]) emailGroups[email] = [];
    emailGroups[email].push(m);
  });

  for (const [email, group] of Object.entries(emailGroups)) {
    if (group.length > 1) {
      console.log(`Found ${group.length} profiles for ${email}`);
      
      // Sort: Oldest first (joinedAt or createdAt)
      group.sort((a, b) => (a.joinedAt || a.createdAt) - (b.joinedAt || b.createdAt));
      
      const primary = group[0];
      const duplicates = group.slice(1);
      
      let totalFeesMigrated = 0;

      for (const duplicate of duplicates) {
        console.log(`  Merging duplicate ${duplicate._id} into ${primary._id}`);
        
        // 1. Move payments
        const paymentUpdate = await Payment.updateMany(
          { member: duplicate._id },
          { $set: { member: primary._id } }
        );
        console.log(`    Moved ${paymentUpdate.modifiedCount} payments`);
        
        // 2. Aggregate committees
        duplicate.committees.forEach(c => {
          if (!primary.committees.includes(c)) {
            primary.committees.push(c);
          }
        });
        
        totalFeesMigrated += (duplicate.feesDue || 0);

        // 3. Delete duplicate
        await Member.findByIdAndDelete(duplicate._id);
      }
      
      primary.feesDue = (primary.feesDue || 0) + totalFeesMigrated;
      await primary.save();
      console.log(`  Primary profile ${primary._id} updated.`);
    }
  }

  console.log('Cleanup finished.');
  process.exit();
}

cleanup();
