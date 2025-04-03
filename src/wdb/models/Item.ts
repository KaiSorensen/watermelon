import { Model } from '@nozbe/watermelondb'
import { field, text, date, relation } from '@nozbe/watermelondb/decorators'

export default class Item extends Model {
  static table = 'items'

  static associations = {
    lists: { type: 'belongs_to' as const, key: 'list_id' },
  }

  @relation('lists', 'list_id') list!: any
  @text('title') title!: string | null
  @text('content') content!: string
  @text('image_urls') imageUrls!: string // Stored as JSON string
  @field('order_index') orderIndex!: number | null
  @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date
} 