import app from './app.js';
import connectDB from './db/dbconfig.js';

connectDB();


app.listen(3000, () => {
  console.log(`Server running at http://localhost:3000`);
});
