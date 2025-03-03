CREATE TABLE Users (
  id UUID PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  avatarURL VARCHAR(255),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notifsEnabled BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE Folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ownerID UUID NOT NULL,
  parentFolderID UUID,  -- NULL for root folders
  listIDs UUID,
  name VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerID) REFERENCES Users(id),
  FOREIGN KEY (parentFolderID) REFERENCES Folders(id)
);

CREATE TABLE Lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ownerID UUID NOT NULL,
  -- optional folder association
  title VARCHAR(255) NOT NULL,
  description TEXT,
  coverImageURL VARCHAR(255),
  isPublic BOOLEAN NOT NULL DEFAULT FALSE,
  downloadCount INTEGER NOT NULL DEFAULT 0,
  sortOrder VARCHAR(15) NOT NULL CHECK (
    sortOrder IN (
      'date-first',
      'date-last',
      'alphabetical',
      'manual'
    )
  ),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Flattened settings fields:
  today BOOLEAN NOT NULL DEFAULT FALSE,
  notifyOnNew BOOLEAN NOT NULL DEFAULT FALSE,
  notifyTime TIMESTAMP,
  notifyDays VARCHAR(10) CHECK (
    notifyDays IN (
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    )
  ),
  FOREIGN KEY (ownerID) REFERENCES Users(id),
  FOREIGN KEY (parentFolderID) REFERENCES Folders(id)
);

-- folder_lists is a many-to-many relationship between folders and lists
CREATE TABLE FolderLists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ownerID UUID NOT NULL,
  folderID UUID NOT NULL,
  listID UUID NOT NULL,
  orderIndex INTEGER NOT NULL DEFAULT 0,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(folderID, listID),
  FOREIGN KEY (ownerID) REFERENCES Users(id),
  FOREIGN KEY (folderID) REFERENCES Folders(id),
  FOREIGN KEY (listID) REFERENCES Lists(id)
);


CREATE TABLE Items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listID UUID NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  imageURLs TEXT [], -- PostgreSQL array; alternatively, store image URLs in a separate table
  orderIndex INTEGER,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listID) REFERENCES Lists(id),
  FOREIGN KEY (ownerID) REFERENCES Users(id)
);