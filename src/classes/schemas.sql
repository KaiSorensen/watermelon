CREATE TABLE Users (
  id UUID PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  avatarURL VARCHAR(255),
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  theme VARCHAR(10) NOT NULL CHECK (theme IN ('light', 'dark')),
  notifsEnabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE Folders (
  id UUID PRIMARY KEY,
  ownerID UUID NOT NULL,
  parentFolderID UUID,
  -- NULL for root folders
  name VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerID) REFERENCES Users(id),
  FOREIGN KEY (parentFolderID) REFERENCES Folders(id)
);

CREATE TABLE Lists (
  id UUID PRIMARY KEY,
  ownerID UUID NOT NULL,
  parentFolderID UUID,
  -- optional folder association
  title VARCHAR(255) NOT NULL,
  description TEXT,
  coverImageURL VARCHAR(255),
  isPublic BOOLEAN NOT NULL DEFAULT FALSE,
  downloadCount INTEGER NOT NULL DEFAULT 0,
  sortOrder VARCHAR(20) NOT NULL CHECK (
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

CREATE TABLE ListItems (
  id UUID PRIMARY KEY,
  listID UUID NOT NULL,
  ownerID UUID NOT NULL,
  title VARCHAR(255),
  content TEXT NOT NULL,
  imageURLs TEXT [],
  -- PostgreSQL array; alternatively, store image URLs in a separate table
  orderIndex INTEGER,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (listID) REFERENCES Lists(id),
  FOREIGN KEY (ownerID) REFERENCES Users(id)
);