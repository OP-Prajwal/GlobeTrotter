const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API key found");
    process.exit(1);
}

fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
    .then(res => res.json())
    .then(data => {
        fs.writeFileSync('models.json', JSON.stringify(data, null, 2), 'utf8');
        console.log("Success: Written to models.json");
    })
    .catch(err => {
        console.error(err);
        fs.writeFileSync('models.json', JSON.stringify({ error: err.toString() }), 'utf8');
    });
