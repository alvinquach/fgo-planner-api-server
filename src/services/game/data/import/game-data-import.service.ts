import { GameItem, GameServant } from 'data/types';
import { GameDataImportOptions, GameDataImportResult, GameDataImportResultSet } from 'dto';
import { Inject, Service } from 'typedi';
import { GameItemService } from '../../game-item.service';
import { GameServantService } from '../../game-servant.service';
import { AtlasAcademyDataImportService } from './atlas-academy/atlas-academy-data-import.service';

@Service()
export class GameDataImportService {

    @Inject()
    private _gameItemService: GameItemService;

    @Inject()
    private _gameServantService: GameServantService;

    @Inject()
    private _atlasAcademyDataImportService: AtlasAcademyDataImportService;

    async importFromAtlasAcademy(options: GameDataImportOptions): Promise<GameDataImportResultSet> {
        const resultSet: GameDataImportResultSet = {};
        // TODO Ensure entities are sorted before writing to database.
        if (options.servants?.import) {
            const log: any[] = [];
            const servants = await this._atlasAcademyDataImportService.getServants(log);
            const result = await this._processServants(servants, options, log);
            resultSet.servants = result;
        }
        if (options.items?.import) {
            const log: any[] = [];
            const items = await this._atlasAcademyDataImportService.getItems(log);
            const result = await this._processItems(items, options, log);
            resultSet.items = result;
        }
        return resultSet;
    }

    //#region Servant methods

    /**
     * Writes the imported servants to the database according to the options.
     * Assumes that there are no conflicts with unique fields such as
     * `collectionNo`.
     */
    private async _processServants(servants: GameServant[], options: GameDataImportOptions, log: any[] = []): Promise<GameDataImportResult> {
        let updated = 0, created = 0, errors = 0;
        const override = !!options.servants.override;
        for (const servant of servants) {
            try {
                let exists: boolean;
                if (override) {
                    exists = await this._processServantOverride(servant);
                } else {
                    exists = await this._processServantAppend(servant);
                }
                if (exists) {
                    updated++;
                } else {
                    created++;
                }
            } catch (err) {
                log.push(err);
                errors++;
            }
        }
        return { updated, created, errors, log };
    }

    /**
     * Writes the imported servant to the database, overriding existing servant
     * data if it is already in the database. Assumes that there are no conflicts
     * with unique fields such as `collectionNo`.
     */
    private async _processServantOverride(servant: GameServant): Promise<boolean> {
        const exists = await this._gameServantService.existsById(servant._id);
        if (!exists) {
            await this._gameServantService.create(servant);
        } else {
            await this._gameServantService.update(servant);
        }
        return exists;
    }

    /**
     * Writes the imported servant to the database, appending to existing servant
     * data if it is already in the database. Assumes that there are no conflicts
     * with unique fields such as `collectionNo`.
     */
    private async _processServantAppend(servant: GameServant): Promise<boolean> {
        const existing = await this._gameServantService.findById(servant._id);
        if (!existing) {
            await this._gameServantService.create(servant);
        } else {
            // TODO append data to existing copy
            await this._gameServantService.update(existing);
        }
        return !!existing;
    }

    //#endregion


    //#region Item methods

    /**
     * Writes the imported items to the database according to the options.
     */
    private async _processItems(items: GameItem[], options: GameDataImportOptions, log: any[] = []): Promise<GameDataImportResult> {
        let updated = 0, created = 0, errors = 0;
        const override = !!options.items.override;
        for (const item of items) {
            try {
                let exists: boolean;
                if (override) {
                    exists = await this._processItemOverride(item);
                } else {
                    exists = await this._processItemAppend(item);
                }
                if (exists) {
                    updated++;
                } else {
                    created++;
                }
            } catch (err) {
                log.push(err);
                errors++;
            }
        }
        return { updated, created, errors, log };
    }

    /**
     * Writes the imported item to the database, overriding existing item data if
     * it is already in the database.
     */
    private async _processItemOverride(item: GameItem): Promise<boolean> {
        const exists = await this._gameItemService.existsById(item._id);
        if (!exists) {
            await this._gameItemService.create(item);
        } else {
            await this._gameItemService.update(item);
        }
        return exists;
    }

    /**
     * Writes the imported item to the database, appending to existing item data if
     * it is already in the database.
     */
    private async _processItemAppend(item: GameItem): Promise<boolean> {
        const existing = await this._gameItemService.findById(item._id);
        if (!existing) {
            await this._gameItemService.create(item);
        } else {
            existing.type = item.type;
            await this._gameItemService.update(existing);
        }
        return !!existing;
    }

    //#endregion

}