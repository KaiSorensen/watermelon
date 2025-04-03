import { Model } from '@nozbe/watermelondb'
import { field, text, date } from '@nozbe/watermelondb/decorators'

export default class User extends Model {
  static table = 'users'

  static associations = {
    folders: { type: 'has_many' as const, foreignKey: 'owner_id' },
    lists: { type: 'has_many' as const, foreignKey: 'owner_id' },
    library_lists: { type: 'has_many' as const, foreignKey: 'owner_id' },
  }

  @text('username') username!: string
  @text('email') email!: string
  @text('avatar_url') avatarUrl!: string | null
  @field('notifs_enabled') notifsEnabled!: boolean
  @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date
} 