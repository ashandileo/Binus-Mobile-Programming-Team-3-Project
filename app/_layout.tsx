import { Stack } from "expo-router";
import { PaperProvider } from "react-native-paper";
import { SQLiteProvider, SQLiteDatabase } from "expo-sqlite";
import "../global.css";

const createDbIfNeeded = async (db: SQLiteDatabase) => {
  console.log("Creating database schema");
  try {
    // Create the surveys table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS surveys (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        street TEXT, 
        description TEXT, 
        lokasi TEXT, 
        tanggal TEXT, 
        image TEXT,
        category TEXT
      )
    `);
    
    // Check if there's any data in the surveys table
    const result = await db.getAllAsync('SELECT COUNT(*) as count FROM surveys');
    const count = (result[0] as { count: number }).count;
    
    // Insert sample data if the table is empty
    if (count === 0) {
      const sampleData = [
        {
          street: "Jalan Mangga Besar",
          description: "Jalan berlubang dan rusak parah",
          lokasi: "Bogor",
          tanggal: "12-04-2025",
          image: "https://picsum.photos/id/1/700",
          category: "pothole"
        },
        {
          street: "Jalan Sudirman",
          description: "Trotoar tidak rata dan berbahaya",
          lokasi: "Jakarta",
          tanggal: "10-04-2025",
          image: "https://picsum.photos/id/28/700",
          category: "sidewalk"
        },
        {
          street: "Jalan Pahlawan",
          description: "Lampu jalan tidak berfungsi",
          lokasi: "Bandung",
          tanggal: "05-04-2025",
          image: "https://picsum.photos/id/65/700",
          category: "streetlight"
        },
        {
          street: "Jalan Diponegoro",
          description: "Saluran air tersumbat",
          lokasi: "Surabaya",
          tanggal: "01-04-2025",
          image: "https://picsum.photos/id/87/700",
          category: "drainage"
        },
      ];
      
      for (const item of sampleData) {
        await db.runAsync(
          `INSERT INTO surveys (street, description, lokasi, tanggal, image, category) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [item.street, item.description, item.lokasi, item.tanggal, item.image, item.category]
        );
      }
      console.log("Sample data inserted");
    }
    
    console.log("Database setup complete");
  } catch (error) {
    console.error("Error setting up database:", error);
  }
};

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="surveydb.db" onInit={createDbIfNeeded}>
      <PaperProvider>
        <Stack />
      </PaperProvider>
    </SQLiteProvider>
  );
}
