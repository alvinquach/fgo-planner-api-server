import { GameCraftEssence } from 'data/types';
import mongoose, { Document, Schema, SchemaDefinition } from 'mongoose';
import { GameObjectSchemaTextIndex, GamePlayerObjectSchema } from './game-object-schema-definitions';

export type GameCraftEssenceDocument = Document & GameCraftEssence;

const schemaDefinition: SchemaDefinition = {
    ...GamePlayerObjectSchema,
    cost: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
        default: 1,
    },
};

const schema = new Schema(schemaDefinition, { timestamps: true });

// Add text index
schema.index(
    GameObjectSchemaTextIndex,
    {
        name: 'textIndex',
        weights: {
            urlString: 5,
            name: 5,
            nameJp: 3,
        }
    }
);

export const GameCraftEssenceModel = mongoose.model<GameCraftEssenceDocument>('GameCraftEssence', schema, 'GameCraftEssences');