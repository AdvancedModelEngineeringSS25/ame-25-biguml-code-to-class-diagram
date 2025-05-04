/**********************************************************************************
 * Copyright (c) 2025 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 **********************************************************************************/
import { BIGReactWebview } from '@borkdominik-biguml/big-vscode-integration/vscode';
import { inject, injectable, postConstruct } from 'inversify';
import { RequestSelectFolderAction, SelectedFolderResponseAction } from '../common/code-to-class-diagram.action.js';

export const CodeToClassDiagramViewId = Symbol('CodeToClassDiagramViewId');

@injectable()
export class CodeToClassDiagramProvider extends BIGReactWebview {
    @inject(CodeToClassDiagramViewId)
    viewId: string;

    protected override cssPath = ['code-to-class-diagram', 'bundle.css'];
    protected override jsPath = ['code-to-class-diagram', 'bundle.js'];
    protected readonly actionCache = this.actionListener.createCache([SelectedFolderResponseAction.KIND]);

    @postConstruct()
    protected override init(): void {
        super.init();

        this.toDispose.push(this.actionCache);
    }


    protected override handleConnection(): void {
        super.handleConnection();

        this.toDispose.push(
            this.actionCache.onDidChange(message => {this.webviewConnector.dispatch(message)}),
            this.webviewConnector.onReady(() => {
                this.requestFolder();
            }),
            //this.webviewConnector.onVisible(() => this.webviewConnector.dispatch(this.actionCache.getActions())),
            this.connectionManager.onDidActiveClientChange(() => {
                console.warn("onDidActiveClientChange")
                this.requestFolder();
            }),
            this.connectionManager.onNoActiveClient(() => {
                console.warn("onNoActiveClient")
                // Send a message to the webview when there is no active client
                this.webviewConnector.dispatch(SelectedFolderResponseAction.create());
            }),
            this.connectionManager.onNoConnection(() => {
                console.warn("onNoConnection")
                // Send a message to the webview when there is no glsp client
                this.webviewConnector.dispatch(SelectedFolderResponseAction.create());
            }),
            this.modelState.onDidChangeModelState(() => {
                console.warn("onDidChangeModelState")
                this.requestFolder();
            })
        );

    }

    // protected override handleConnection(): void {
    //     super.handleConnection();

    //     this.toDispose.push(
    //         // this.actionCache.onDidChange(message => this.webviewConnector.dispatch(message)),
    //         this.webviewConnector.onReady(() => {
    //             // this.requestCount();
    //             // this.selectFolder();
    //             // this.actionDispatcher.dispatch(InitClientHandshakeAction.create());
    //             // this.webviewConnector.dispatch(this.actionCache.getActions());
    //             this.requestFolder();
    //         }),
    //         // this.webviewConnector.onVisible(() => this.webviewConnector.dispatch(this.actionCache.getActions())),
    //         this.connectionManager.onDidActiveClientChange(() => {
    //             // this.requestCount();
    //             // this.selectFolder();
    //             this.requestFolder();
    //         }),
    //         // this.connectionManager.onNoActiveClient(() => {
    //         //     // Send a message to the webview when there is no active client
    //         //     this.webviewConnector.dispatch(RequestSelectFolderAction.create());
    //         // }),
    //         // this.connectionManager.onNoConnection(() => {
    //         //     // Send a message to the webview when there is no glsp client
    //         //     // this.webviewConnector.dispatch(CodeToClassDiagramActionResponse.create());
    //         // }),
    //         this.modelState.onDidChangeModelState(() => {
    //             // this.requestCount();
    //             // this.selectFolder();
    //             this.requestFolder();
    //         })
    //     );
    // }

    protected requestFolder(): void {
        this.actionDispatcher.dispatch(
            RequestSelectFolderAction.create()
        );
    }

    
    // protected selectFolder(): void {
    //     this.actionDispatcher.dispatch(
    //         RequestSelectFolderAction.create()
    //     );
    // }

    // protected override initConnection(providerContext: BIGWebviewProviderContext): void {
        
    // }
}
