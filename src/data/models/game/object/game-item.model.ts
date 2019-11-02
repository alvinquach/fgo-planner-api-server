import { GameItem, GameItemCategory } from 'data/types';
import mongoose, { Document, Schema, SchemaDefinition } from 'mongoose';
import { GameObjectSchema } from '../../common-schema-definitions';

export type GameItemDocument = Document & GameItem;

const schemaDefinition: SchemaDefinition = {
    ...GameObjectSchema,
    rarity: {
        ...GameObjectSchema.rarity,
        max: 3 // Rarity for items ranges from 1 thru 3.
    },
    description: String,
    categories: {
        type: [String],
        enum: Object.keys(GameItemCategory),
        required: true,
        default: []
    }
};

const schema = new Schema(schemaDefinition, { timestamps: true });

export const GameItemModel = mongoose.model<GameItemDocument>('GameItem', schema, 'GameItems');