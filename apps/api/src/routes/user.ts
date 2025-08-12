import { Hono, Context } from 'hono';
import { DrizzleD1Database } from 'drizzle-orm/d1';
import { 
  users, 
  progressTable, 
  userLanguages, 
  userTopics, 
  goals, 
  notificationsTable 
} from '../db/schema';
import { eq } from 'drizzle-orm';
import { Bindings } from '../index';

const userRoutes = new Hono<{
  Bindings: Bindings;
  Variables: { db: DrizzleD1Database };
}>();

userRoutes.get('/', async (c) => {
  try {
    const db = (c as Context & { db: DrizzleD1Database }).db;
    const userList = await db.select().from(users).all();
    return c.json(userList);
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.text('Internal Server Error', 500);
  }
});

userRoutes.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const db = (c as Context & { db: DrizzleD1Database }).db;
    const user = await db.select().from(users).where(eq(users.id, id)).get();
    return user ? c.json(user) : c.text('User not found', 404);
  } catch (error) {
    console.error('Error fetching user:', error);
    return c.text('Internal Server Error', 500);
  }
});

userRoutes.post('/', async (c) => {
  try {
    const db = (c as Context & { db: DrizzleD1Database }).db;
    const { username, email, passwordHash } = await c.req.json();
    const user = await db
      .insert(users)
      .values({ username, email, passwordHash })
      .execute();
    return c.json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    return c.text('Internal Server Error', 500);
  }
});

// Export user data endpoint
userRoutes.get('/:id/export', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    const format = c.req.query('format') || 'json';
    const since = c.req.query('since'); // ISO date string for incremental exports
    
    const db = (c as Context & { db: DrizzleD1Database }).db;
    
    // Get user data
    const user = await db.select().from(users).where(eq(users.id, id)).get();
    if (!user) {
      return c.text('User not found', 404);
    }

    // Collect all user-related data
    const [
      progress,
      userLanguageData,
      userTopicData,
      userGoals,
      userNotifications
    ] = await Promise.all([
      db.select().from(progressTable).where(eq(progressTable.userId, id)).all(),
      db.select().from(userLanguages).where(eq(userLanguages.userId, id)).all(),
      db.select().from(userTopics).where(eq(userTopics.userId, id)).all(),
      db.select().from(goals).where(eq(goals.userId, id)).all(),
      db.select().from(notificationsTable).where(eq(notificationsTable.userId, id)).all()
    ]);

    // Apply incremental export filter if 'since' parameter is provided
    let filteredData = {
      user,
      progress,
      userLanguages: userLanguageData,
      userTopics: userTopicData,
      goals: userGoals,
      notifications: userNotifications
    };

    if (since) {
      const sinceDate = new Date(since).toISOString();
      // Filter data based on lastUpdated/createdAt fields
      filteredData = {
        user,
        progress: progress.filter(p => p.lastUpdated && p.lastUpdated >= sinceDate),
        userLanguages: userLanguageData, // Note: userLanguages doesn't have timestamp, include all
        userTopics: userTopicData, // Note: userTopics doesn't have timestamp, include all
        goals: userGoals, // Note: goals doesn't have timestamp, include all
        notifications: userNotifications.filter(n => n.lastSent && n.lastSent >= sinceDate)
      };
    }

    // Create export metadata
    const exportMetadata = {
      exportDate: new Date().toISOString(),
      format,
      version: '1.0.0',
      userId: id,
      incremental: !!since,
      sinceDateFilter: since || null
    };

    if (format === 'csv') {
      // Generate CSV format optimized for spreadsheets
      const csvData = generateCSVExport(filteredData, exportMetadata);
      
      c.header('Content-Type', 'text/csv');
      c.header('Content-Disposition', `attachment; filename="user-${id}-export-${exportMetadata.exportDate.split('T')[0]}.csv"`);
      return c.text(csvData);
    } else {
      // Default JSON format with complete referential integrity
      const jsonData = {
        metadata: exportMetadata,
        data: filteredData
      };
      
      c.header('Content-Type', 'application/json');
      c.header('Content-Disposition', `attachment; filename="user-${id}-export-${exportMetadata.exportDate.split('T')[0]}.json"`);
      return c.json(jsonData);
    }
    
  } catch (error) {
    console.error('Error exporting user data:', error);
    return c.text('Internal Server Error', 500);
  }
});

// Helper function to generate CSV export
function generateCSVExport(data: any, metadata: any): string {
  const lines: string[] = [];
  
  // Add metadata header
  lines.push('# Polyglottos User Data Export');
  lines.push(`# Export Date: ${metadata.exportDate}`);
  lines.push(`# Format: ${metadata.format}`);
  lines.push(`# Version: ${metadata.version}`);
  lines.push(`# User ID: ${metadata.userId}`);
  lines.push(`# Incremental: ${metadata.incremental}`);
  if (metadata.sinceDateFilter) {
    lines.push(`# Since: ${metadata.sinceDateFilter}`);
  }
  lines.push('');

  // User Information
  lines.push('## User Information');
  lines.push('id,username,email,createdAt');
  const user = data.user;
  lines.push(`${user.id},"${user.username}","${user.email}","${user.createdAt || ''}"`);
  lines.push('');

  // Progress Data
  if (data.progress && data.progress.length > 0) {
    lines.push('## Progress Data');
    lines.push('id,userId,questionsAnswered,correctAnswers,quizzesTaken,goals,cumulativeStats,lastUpdated');
    data.progress.forEach((p: any) => {
      lines.push(`${p.id},${p.userId},${p.questionsAnswered || 0},${p.correctAnswers || 0},${p.quizzesTaken || 0},"${p.goals || ''}","${p.cumulativeStats || ''}","${p.lastUpdated || ''}"`);
    });
    lines.push('');
  }

  // User Languages
  if (data.userLanguages && data.userLanguages.length > 0) {
    lines.push('## User Languages');
    lines.push('userId,languageId,lessonsCompleted,quizzesTaken,quizzesPassed,rollingAverageAccuracy');
    data.userLanguages.forEach((ul: any) => {
      lines.push(`${ul.userId},${ul.languageId},${ul.lessonsCompleted},${ul.quizzesTaken},${ul.quizzesPassed},${ul.rollingAverageAccuracy}`);
    });
    lines.push('');
  }

  // User Topics
  if (data.userTopics && data.userTopics.length > 0) {
    lines.push('## User Topics');
    lines.push('userId,topicId,completed');
    data.userTopics.forEach((ut: any) => {
      lines.push(`${ut.userId},${ut.topicId},${ut.completed}`);
    });
    lines.push('');
  }

  // Goals
  if (data.goals && data.goals.length > 0) {
    lines.push('## Goals');
    lines.push('id,userId,language,description,endDate,isPrivate,notificationFrequency');
    data.goals.forEach((g: any) => {
      lines.push(`${g.id},${g.userId},"${g.language}","${g.description}","${g.endDate}",${g.isPrivate},"${g.notificationFrequency || ''}"`);
    });
    lines.push('');
  }

  // Notifications
  if (data.notifications && data.notifications.length > 0) {
    lines.push('## Notifications');
    lines.push('id,userId,goalId,frequency,type,lastSent');
    data.notifications.forEach((n: any) => {
      lines.push(`${n.id},${n.userId},${n.goalId},"${n.frequency}","${n.type}","${n.lastSent || ''}"`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

export default userRoutes;
