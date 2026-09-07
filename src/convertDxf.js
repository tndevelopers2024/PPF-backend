import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dxf from 'dxf';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;
  const patterns = await db.collection('patterns').find({ 'files.dxf': { $exists: true } }).toArray();
  
  for (const p of patterns) {
    if (!p.files?.dxf?.url) continue;
    const dxfRelativePath = p.files.dxf.url.replace(/^\//, '');
    if (fs.existsSync(dxfRelativePath)) {
      console.log('Converting', dxfRelativePath);
      const content = fs.readFileSync(dxfRelativePath, 'utf8');
      const parsed = dxf.parseString(content);
      let svg = dxf.toSVG(parsed);
      // Replace faint strokes with vibrant cutting teal and good stroke width
      svg = svg.replace(/stroke-width="[^"]*"/g, 'stroke-width="0.08" vector-effect="non-scaling-stroke"')
               .replace(/stroke="rgb\(255, 0, 63\)"/g, 'stroke="#14b8a6"')
               .replace(/stroke="#000000"/g, 'stroke="#14b8a6"');
      const svgRelativePath = dxfRelativePath + '.svg';
      fs.writeFileSync(svgRelativePath, svg, 'utf8');
      const svgUrl = '/' + svgRelativePath.replace(/\\/g, '/');
      await db.collection('patterns').updateOne(
        { _id: p._id },
        { $set: { 'files.svg': { url: svgUrl, key: path.basename(svgRelativePath) } } }
      );
      console.log('Successfully updated pattern:', p._id, 'with SVG:', svgUrl);
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
