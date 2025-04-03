import { Model } from '@nozbe/watermelondb'
import { field, text, date, relation } from '@nozbe/watermelondb/decorators'

export default class LibraryList extends Model {
  static table = 'library_lists'

  static associations = {
    users: { type: 'belongs_to' as const, key: 'owner_id' },
    folders: { type: 'belongs_to' as const, key: 'folder_id' },
    lists: { type: 'belongs_to' as const, key: 'list_id' },
  }

  @relation('users', 'owner_id') owner!: any
  @relation('folders', 'folder_id') folder!: any
  @relation('lists', 'list_id') list!: any
  @field('order_index') orderIndex!: number
  @text('sort_order') sortOrder!: string
  @field('today') today!: boolean
  @field('current_item') currentItem!: string | null
  @field('notify_on_new') notifyOnNew!: boolean
  @date('notify_time') notifyTime!: Date | null
  @text('notify_days') notifyDays!: string | null
  @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date
} 