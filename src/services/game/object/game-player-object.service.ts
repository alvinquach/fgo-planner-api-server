import { GamePlayerObjectModel } from 'data/models';
import { GamePlayerObject } from 'data/types';
import { Pagination } from 'internal';
import { Document } from 'mongoose';
import { GameObjectService } from './game-object.service';

/**
 * Abstract service that provides basic CRUD operations and utility functions
 * for querying database collections of `GamePlayerObject` typed models.
 */
export abstract class GamePlayerObjectService<T extends GamePlayerObject> extends GameObjectService<T> {

    constructor(protected _model: GamePlayerObjectModel<T & Document>) {
        super(_model);
    }
    
    async findAllGameIds() {
        return this._model.findAllGameIds().exec();
    }

    async findAllUrlPaths() {
        return this._model.findAllUrlPaths().exec();
    }

    async findByUrlPath(urlPath: string) {
        return this._model.findByUrlPath(urlPath).exec();
    }

    async existsByUrlPath(urlPath: string) {
        return this._model.existsByUrlPath(urlPath);
    }

    // TODO Add queries by gameId.

    protected _generateSearchQuery(query: {[key: string]: string}, page: Pagination) {
        const _query = super._generateSearchQuery(query, page);
        const conditions = _query.conditions;
        if (query.regions != null) {
            query.regions.split(',').forEach(region => {
                conditions[`gameRegions.${region}`] = true;
            });
        }
        return _query;
    }

}