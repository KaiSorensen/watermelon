-- Default data for user 7dc7a90c-1385-4e53-bb1f-e7c8dcc7015d
-- This script creates a default set of folders, lists, and items for a new user
-- It will be used when a new user is created in the system
-- Data is based on src/DefaultData.json

-- Insert the user
INSERT INTO Users (id, username, email, avatarURL, notifsEnabled)
VALUES (
  '7dc7a90c-1385-4e53-bb1f-e7c8dcc7015d',
  'New User',
  'user@example.com',
  NULL,
  FALSE
);

-- Create the Wisdom folder
INSERT INTO Folders (id, ownerID, parentFolderID, name)
VALUES (
  'f1d8e7c6-b5a4-3210-9876-543210fedcba',
  '7dc7a90c-1385-4e53-bb1f-e7c8dcc7015d',
  NULL,
  'Wisdom'
);

-- Create the Notes folder
INSERT INTO Folders (id, ownerID, parentFolderID, name)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '7dc7a90c-1385-4e53-bb1f-e7c8dcc7015d',
  NULL,
  'Notes'
);

-- Create the Quotes list
INSERT INTO Lists (
  id, 
  ownerID, 
  parentFolderID,
  title, 
  description, 
  coverImageURL, 
  isPublic, 
  downloadCount, 
  sortOrder, 
  today, 
  notifyOnNew, 
  notifyTime, 
  notifyDays
)
VALUES (
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  '7dc7a90c-1385-4e53-bb1f-e7c8dcc7015d',
  'f1d8e7c6-b5a4-3210-9876-543210fedcba',
  'Quotes',
  'Inspirational quotes to brighten your day',
  NULL,
  FALSE,
  0,
  'date-first',
  FALSE,
  FALSE,
  NULL,
  NULL
);

-- Associate Quotes list with Wisdom folder
INSERT INTO FolderLists (ownerID, folderID, listID, orderIndex)
VALUES (
  '7dc7a90c-1385-4e53-bb1f-e7c8dcc7015d',
  'f1d8e7c6-b5a4-3210-9876-543210fedcba',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  0
);

-- Create the Poems list
INSERT INTO Lists (
  id, 
  ownerID, 
  parentFolderID,
  title, 
  description, 
  coverImageURL, 
  isPublic, 
  downloadCount, 
  sortOrder, 
  today, 
  notifyOnNew, 
  notifyTime, 
  notifyDays
)
VALUES (
  'p1o2i3u4-y5t6-r7e8-w9q0-zxcvbnmasdfg',
  '7dc7a90c-1385-4e53-bb1f-e7c8dcc7015d',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Poems',
  'A collection of beautiful poems',
  NULL,
  FALSE,
  0,
  'date-first',
  FALSE,
  FALSE,
  NULL,
  NULL
);

-- Create the Insights list
INSERT INTO Lists (
  id, 
  ownerID, 
  parentFolderID,
  title, 
  description, 
  coverImageURL, 
  isPublic, 
  downloadCount, 
  sortOrder, 
  today, 
  notifyOnNew, 
  notifyTime, 
  notifyDays
)
VALUES (
  'i1n2s3i4-g5h6-t7s8-9012-mnbvcxzlkjhg',
  '7dc7a90c-1385-4e53-bb1f-e7c8dcc7015d',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Insights',
  'Personal insights and reflections',
  NULL,
  FALSE,
  0,
  'date-first',
  FALSE,
  FALSE,
  NULL,
  NULL
);

-- Associate Poems and Insights lists with Notes folder
INSERT INTO FolderLists (ownerID, folderID, listID, orderIndex)
VALUES (
  '7dc7a90c-1385-4e53-bb1f-e7c8dcc7015d',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'p1o2i3u4-y5t6-r7e8-w9q0-zxcvbnmasdfg',
  0
);

INSERT INTO FolderLists (ownerID, folderID, listID, orderIndex)
VALUES (
  '7dc7a90c-1385-4e53-bb1f-e7c8dcc7015d',
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'i1n2s3i4-g5h6-t7s8-9012-mnbvcxzlkjhg',
  1
);

-- Add items to Quotes list from DefaultData.json
INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q01-item-uuid-0000-000000000001',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Jordan Peterson',
  'There are cathedrals everywhere for those with the eyes to see.',
  0
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q02-item-uuid-0000-000000000002',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Carl Sagan',
  'We are like butterflies who flutter for a day and think it is forever.',
  1
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q03-item-uuid-0000-000000000003',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Man''s Search for Meaning',
  'No man should judge unless he asks himself an absolute honesty whether, in a similar situation, he might not have done the same.',
  2
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q04-item-uuid-0000-000000000004',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Fyodor Dostoevsky',
  'There is only one thing that I dread: not to be worthy of my sufferings.',
  3
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q05-item-uuid-0000-000000000005',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Spinoza''s Ethics',
  'Emotion, which is suffering, ceases to be suffering as soon as we form a clear and precise picture of it.',
  4
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q06-item-uuid-0000-000000000006',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Richard Feynman',
  'Study hard what interests you the most in the most undisciplined, irreverent, and original manner.',
  5
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q07-item-uuid-0000-000000000007',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Dumbledore',
  'Words are, in my not-so-humble opinion, our most inexhaustible source of magic. Capable of both inflicting injury and remedying it.',
  6
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q08-item-uuid-0000-000000000008',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Dune',
  'Deep in the human unconscious is a pervasive need for a logical universe that makes sense. But the real universe is always one step beyond logic.',
  7
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q09-item-uuid-0000-000000000009',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Miyamoto Musashi',
  'If you know the way broadly, you will see it in everything.',
  8
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q10-item-uuid-0000-000000000010',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Albert Einstein',
  'God doesn''t play dice with the universe.',
  9
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q11-item-uuid-0000-000000000011',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Neils Bohr',
  'Einstein, stop telling God what to do.',
  10
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q12-item-uuid-0000-000000000012',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Friedrich Nietzsche',
  'The line between good and evil runs through the heart of every man.',
  11
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q13-item-uuid-0000-000000000013',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Dune: Messiah',
  'The convoluted wording of legalisms grew up around the necessity to hide from ourselves the violence we intend toward each other. Between depriving a man of one hour from his life and depriving him of his life there exists only a difference of degree. You have done violence to him, consumed his energy. Elaborate euphemisms may conceal your intent to kill, but behind any use of power over another the ultimate assumption remains: ''I feed on your energy.''',
  12
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q14-item-uuid-0000-000000000014',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Waymond Wang (Everything Everywhere All At Once)',
  'Even though you broke my heart yet again, in another life I would''ve really liked just doing laundry and taxes with you. I''m not kind because I''m naive; I''m kind because it''s strategic and necessary.',
  13
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q15-item-uuid-0000-000000000015',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'William Shakespeare',
  'A rose by any other name would smell as sweet.',
  14
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q16-item-uuid-0000-000000000016',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Friedrich Nietzsche',
  'If you gaze long enough into the abyss, the abyss gazes back into you.',
  15
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q17-item-uuid-0000-000000000017',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Jordan Peterson',
  'You have very little right to break rules, until you have mastered them.',
  16
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'q18-item-uuid-0000-000000000018',
  'q1w2e3r4-t5y6-u7i8-o9p0-asdfghjklzxc',
  'Proverbs 3:5-6',
  'In all your ways acknowledge him, and he will make straight your paths.',
  17
);

-- Add items to Poems list from DefaultData.json
INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'p01-item-uuid-0000-000000000001',
  'p1o2i3u4-y5t6-r7e8-w9q0-zxcvbnmasdfg',
  NULL,
  'I would give anything for your friendship
You have no idea
 I would take a bullet just to let you live
You''re worth it
The countless drinks and times we had
They''ll lift me up to Heaven
And when I''m gone I''ll bless you all the way
Your guardian all the way
All the way until our next lives
All the way
You brought me more than could fit into one life
Memories I wish I could sink into forever
You marks on my soul age like leather
I''ll love you forever',
  0
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'p02-item-uuid-0000-000000000002',
  'p1o2i3u4-y5t6-r7e8-w9q0-zxcvbnmasdfg',
  NULL,
  'I can''t even complain
Just look what you''ve become
It''s too bad it ain''t with me
I''ll drop the roses by your feet
Why would I pay for your ring
When I could go to jail for free
And at the rate neighbors hate
I think that''s where I''m bound to be
I''ll make you believe that you''re blessed
While I relieve all your stress
Cause ain''t a damned thing different
About me when you''re present
Like a gift like a beverage
That we share in the basement
Exchanging funny faces
How the fuck did we make
Well I can''t count all the smiles
And I can''t count the laughs
But I hope you remember all the times we had
I know I will',
  1
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'p03-item-uuid-0000-000000000003',
  'p1o2i3u4-y5t6-r7e8-w9q0-zxcvbnmasdfg',
  NULL,
  'I was a rock climber
Down in Utah where I thrive
Orange canyons run for miles
Like a scene from the wild west 
I''ll take the old mountain road',
  2
);

-- Add items to Insights list from DefaultData.json
INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'i01-item-uuid-0000-000000000001',
  'i1n2s3i4-g5h6-t7s8-9012-mnbvcxzlkjhg',
  NULL,
  'Tune into the absurd.',
  0
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'i02-item-uuid-0000-000000000002',
  'i1n2s3i4-g5h6-t7s8-9012-mnbvcxzlkjhg',
  NULL,
  'Curiosity is the first victim of overstimulation.',
  1
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'i03-item-uuid-0000-000000000003',
  'i1n2s3i4-g5h6-t7s8-9012-mnbvcxzlkjhg',
  NULL,
  'Worry not about the language of your visions, but rather the connection of your visions to present sensations.',
  2
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'i04-item-uuid-0000-000000000004',
  'i1n2s3i4-g5h6-t7s8-9012-mnbvcxzlkjhg',
  NULL,
  'All I do is sit and dream about who I could be.',
  3
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'i05-item-uuid-0000-000000000005',
  'i1n2s3i4-g5h6-t7s8-9012-mnbvcxzlkjhg',
  NULL,
  'Your love is given in the shape of your personality.',
  4
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'i06-item-uuid-0000-000000000006',
  'i1n2s3i4-g5h6-t7s8-9012-mnbvcxzlkjhg',
  NULL,
  'From your stay in the wilderness, you take something with you in your heart that guides you thereafter.',
  5
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'i07-item-uuid-0000-000000000007',
  'i1n2s3i4-g5h6-t7s8-9012-mnbvcxzlkjhg',
  NULL,
  'Woven into the fabric of beauty is the nature of truth.',
  6
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'i08-item-uuid-0000-000000000008',
  'i1n2s3i4-g5h6-t7s8-9012-mnbvcxzlkjhg',
  NULL,
  'We live in such a beautiful world: physically, but also in the minds we inhabit. The depth of your eyes runs as deep as the ocean.',
  7
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'i09-item-uuid-0000-000000000009',
  'i1n2s3i4-g5h6-t7s8-9012-mnbvcxzlkjhg',
  NULL,
  'I''m my own mystery.',
  8
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'i10-item-uuid-0000-000000000010',
  'i1n2s3i4-g5h6-t7s8-9012-mnbvcxzlkjhg',
  NULL,
  'Be present, accept your burden, and give energy.',
  9
);

INSERT INTO Items (id, listID, title, content, orderIndex)
VALUES (
  'i11-item-uuid-0000-000000000011',
  'i1n2s3i4-g5h6-t7s8-9012-mnbvcxzlkjhg',
  NULL,
  'Be alive, accept the blues, pay forward the blessings from men before you.',
  10
);

-- End of default data script
-- This script can be run whenever a new user is created to provide them with starter content
