export declare class PanelExtension {
    static SELECT_DESK(desk: any): {
        new (viewer: any, options: any): {
            [x: string]: any;
            pn: {
                [x: string]: any;
                initialize(): void;
            };
            load(): boolean;
            unload(): boolean;
        };
        [x: string]: any;
    };
}
