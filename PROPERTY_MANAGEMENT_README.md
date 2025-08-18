# Property Management & Inventory Validation System

This system allows users to manage multiple properties, each with multiple rooms/lists, and each room with multiple inventory items. It's built with React Native, Expo, and uses a Turso SQLite database with Drizzle ORM.

## 🏗️ **Database Schema**

### **Users**
- `id`: Unique identifier
- `email`: User's email address
- `name`: User's full name
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### **Properties**
- `id`: Unique identifier
- `userId`: References the user who owns the property
- `name`: Property name (e.g., "Main House", "Vacation Home")
- `address`: Property address
- `description`: Property description
- `createdAt`: Property creation timestamp
- `updatedAt`: Last update timestamp

### **Lists (Rooms)**
- `id`: Unique identifier
- `propertyId`: References the property this room belongs to
- `name`: Room name (e.g., "Living Room", "Kitchen")
- `description`: Room description
- `barcode`: Optional QR code/barcode for the room
- `createdAt`: Room creation timestamp
- `updatedAt`: Last update timestamp

### **Items**
- `id`: Unique identifier
- `listId`: References the room this item belongs to
- `name`: Item name
- `description`: Item description
- `quantity`: Number of items (default: 1)
- `condition`: Item condition (new, good, fair, poor, damaged)
- `estimatedValue`: Estimated monetary value
- `imageUrl`: Optional image of the item
- `isCompleted`: Whether item has been validated
- `createdAt`: Item creation timestamp
- `updatedAt`: Last update timestamp

## 🚀 **Getting Started**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Database Setup**
```bash
# Generate migrations
npm run db:generate

# Run migrations (when ready to set up database)
npm run db:migrate

# Open Drizzle Studio for database management
npm run db:studio
```

### **3. Environment Configuration**
For production with Turso:
1. Create a Turso database
2. Get your database URL and auth token
3. Update `src/db/index.ts` with your Turso credentials

## 📱 **App Flow**

### **1. Property Selection Screen**
- Main entry point for inventory validation
- Shows all user properties
- Allows adding new properties
- Each property shows name, address, and description

### **2. Property Details Screen**
- Shows all rooms/lists for a selected property
- Displays room count and item counts
- Allows adding new rooms
- Each room shows name, description, and item count

### **3. Room/List Screen**
- Shows all items in a selected room
- Allows adding, editing, and deleting items
- Supports QR code scanning for quick access
- Tracks item validation status

## 🔧 **Key Features**

### **Property Management**
- ✅ Create multiple properties
- ✅ Add addresses and descriptions
- ✅ Organize by location or purpose

### **Room Organization**
- ✅ Create rooms within properties
- ✅ Add room descriptions
- ✅ Track item counts per room

### **Inventory Management**
- ✅ Add items with descriptions
- ✅ Track item conditions and values
- ✅ Support for images
- ✅ QR code association

### **QR Code Integration**
- ✅ Scan QR codes to access rooms
- ✅ Generate QR codes for rooms
- ✅ Quick navigation between properties

## 🗄️ **Database Operations**

### **CRUD Operations**
All database operations are handled through the service layer in `src/db/services.ts`:

- **Create**: `createProperty()`, `createList()`, `createItem()`
- **Read**: `getPropertyById()`, `getListsByPropertyId()`, `getItemsByListId()`
- **Update**: `updateProperty()`, `updateList()`, `updateItem()`
- **Delete**: `deleteProperty()`, `deleteList()`, `deleteItem()`

### **Relationships**
- Users can have many properties
- Properties can have many rooms/lists
- Rooms can have many items
- All relationships are properly enforced with foreign keys

## 🚀 **Production Deployment**

### **Turso Database Setup**
1. Install Turso CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
2. Create database: `turso db create my-qr-list-db`
3. Get database URL: `turso db show my-qr-list-db --url`
4. Create auth token: `turso db tokens create my-qr-list-db`
5. Update environment variables in your deployment platform

### **Environment Variables**
```bash
TURSO_DATABASE_URL=libsql://your-db-url.turso.io
TURSO_AUTH_TOKEN=your-auth-token
```

## 🧪 **Testing**

### **Local Development**
- Uses local SQLite file (`./local.db`)
- Perfect for development and testing
- No external dependencies

### **Mock Data**
- PropertySelectionScreen includes sample properties
- PropertyDetailsScreen includes sample rooms
- Easy to test without database setup

## 🔮 **Future Enhancements**

### **Planned Features**
- [ ] User authentication and authorization
- [ ] Property sharing between users
- [ ] Advanced inventory reporting
- [ ] Export functionality (CSV, PDF)
- [ ] Offline support with sync
- [ ] Multi-language support
- [ ] Advanced search and filtering

### **Technical Improvements**
- [ ] Database connection pooling
- [ ] Caching layer
- [ ] Real-time updates
- [ ] Push notifications
- [ ] Analytics and usage tracking

## 📚 **API Reference**

### **Navigation Routes**
- `PropertySelection`: Main property selection screen
- `PropertyDetails`: Property details with room list
- `ViewList`: Room inventory management
- `ScanQR`: QR code scanning interface

### **Key Components**
- `PropertySelectionScreen`: Main property management
- `PropertyDetailsScreen`: Room management within properties
- `ActionButton`: Reusable button component
- Database services for all CRUD operations

## 🐛 **Troubleshooting**

### **Common Issues**
1. **Database not found**: Run `npm run db:generate` first
2. **Migration errors**: Check database connection in `src/db/index.ts`
3. **Navigation errors**: Verify all screens are imported in `App.tsx`

### **Debug Mode**
Enable console logging to see database operations and navigation flow.

---

This system provides a robust foundation for property and inventory management, with a clean separation of concerns between UI, business logic, and data persistence.
