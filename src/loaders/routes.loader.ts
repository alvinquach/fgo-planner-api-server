import { AuthenticationController, GameDataImportController, GameEventController, GameItemController, GameServantController, GameSoundtrackController, MasterAccountController, PlanController, TestController, UserController } from 'controllers';
import { Application, Router } from 'express';
import { Dictionary, RequestHandler } from 'express-serve-static-core';
import { Class, ControllerMetadata, MetadataKey, RouteMetadata, UserAccessLevel } from 'internal';
import { AuthenticationService } from 'services';
import Container from 'typedi';

// TODO Make this configurable
const ResourceApiPrefix = '/rest';

const Controllers: Class<any>[] = [
    AuthenticationController,
    UserController,
    MasterAccountController,
    PlanController,
    GameDataImportController,
    GameEventController,
    GameItemController,
    GameServantController,
    GameSoundtrackController,
    TestController
];

const router = Router();

// Authentication middleware from AuthenticationService.
const authService = Container.get(AuthenticationService);
const parseAccessToken = authService.parseAccessToken.bind(authService);
const authenticateAccessToken = authService.authenticateAccessToken.bind(authService);
const authenticateAdminUser = authService.authenticateAdminUser.bind(authService);

/**
 * Registers a controller endpoint with the router.
 * 
 * @param instance The controller instance.
 * @param prefix The path prefix as defined at the controller level.
 * @param controllerAccessLevel The access level as defined at the controller
 * level. This will be used if access level is not defined at the route level.
 * @param route The route metadata.
 */
const registerRoute = (
    instance: any,
    prefix: string,
    controllerAccessLevel: UserAccessLevel,
    route: RouteMetadata,
    ...handlers: RequestHandler<Dictionary<string>>[]
): void => {

    const controllerName = instance.constructor.name;

    /*
     * Add authentication middleware based on route access level.
     * Level 0 -> parseAccessToken
     * Level 1 -> authenticateAccessToken
     * Level 2 -> authenticateAccessToken and authenticateAdminUser
     */
    const accessLevel = route.accessLevel || controllerAccessLevel;
    if (accessLevel >= UserAccessLevel.Authenticated) {
        handlers.push(authenticateAccessToken);
        if (accessLevel >= UserAccessLevel.Admin) {
            handlers.push(authenticateAdminUser);
        }
    } else {
        handlers.push(parseAccessToken);
    }

    // Get handler from controller and append to list of handlers.
    const handlerName = route.handlerName;
    const handler = instance[handlerName];
    if (typeof handler !== 'function') {
        console.error(`Could not register route: ${controllerName}.${handlerName} is not a function.`);
        return;
    }
    handlers.push(handler.bind(instance));

    // Construct path for the route mapping.
    const path = prefix + (route.path || '');

    // Register the route with the router.
    const method = route.method;
    router[method](path, handlers);
    console.log(`Registered ${(method as string).toUpperCase()} method at '${path}' using handler ${controllerName}.${handlerName}.`);
};

/**
 * Registers the endpoints of a controller with the router.
 * @param controller The controller class.
 */
const registerController = (
    prefix: string,
    controller: Class<any>,
    ...handlers: RequestHandler<Dictionary<string>>[]
): void => {
    const instance = Container.get(controller);
    const controllerMetadata: ControllerMetadata = Reflect.getOwnMetadata(MetadataKey.RestController, controller);
    if (controllerMetadata === undefined) {
        console.error(`Could not register controller: ${controller.name} is not a controller.`);
        return;
    }
    const routes: Record<string, RouteMetadata> = Reflect.getMetadata(MetadataKey.RequestMapping, controller);
    for (const key of Object.keys(routes)) {
        const route = routes[key];
        registerRoute(instance, prefix + controllerMetadata.prefix, controllerMetadata.defaultAccessLevel, route, ...handlers);
    }
};

/**
 * Registers a list of controllers to the router.
 */
const registerControllers = (
    prefix: string,
    controllers: Class<any>[],
    ...handlers: RequestHandler<Dictionary<string>>[]
): void => {
    for (const controller of controllers) {
        registerController(prefix, controller, ...handlers);
    }
};

export default (app: Application): void => {
    registerControllers(ResourceApiPrefix, Controllers);
    app.use(router);
};
