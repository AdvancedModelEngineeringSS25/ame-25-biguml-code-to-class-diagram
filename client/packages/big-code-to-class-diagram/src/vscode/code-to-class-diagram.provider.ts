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
import { CodeToClassDiagramActionResponse, RequestCodeToClassDiagramAction } from '../common/code-to-class-diagram.action.js';

export const CodeToClassDiagramViewId = Symbol('CodeToClassDiagramViewId');

@injectable()
export class CodeToClassDiagramProvider extends BIGReactWebview {
    @inject(CodeToClassDiagramViewId)
    viewId: string;

    protected override cssPath = ['code-to-class-diagram', 'bundle.css'];
    protected override jsPath = ['code-to-class-diagram', 'bundle.js'];
    protected readonly actionCache = this.actionListener.createCache([CodeToClassDiagramActionResponse.KIND]);

    @postConstruct()
    protected override init(): void {
        super.init();

        this.toDispose.push(this.actionCache);
    }

    protected override handleConnection(): void {
        super.handleConnection();

        this.toDispose.push(
            this.actionCache.onDidChange(message => this.webviewConnector.dispatch(message)),
            this.webviewConnector.onReady(() => {
                this.requestCount();
                this.webviewConnector.dispatch(this.actionCache.getActions());
            }),
            this.webviewConnector.onVisible(() => this.webviewConnector.dispatch(this.actionCache.getActions())),
            this.connectionManager.onDidActiveClientChange(() => {
                this.requestCount();
            }),
            this.connectionManager.onNoActiveClient(() => {
                // Send a message to the webview when there is no active client
                this.webviewConnector.dispatch(CodeToClassDiagramActionResponse.create());
            }),
            this.connectionManager.onNoConnection(() => {
                // Send a message to the webview when there is no glsp client
                this.webviewConnector.dispatch(CodeToClassDiagramActionResponse.create());
            }),
            this.modelState.onDidChangeModelState(() => {
                this.requestCount();
            })
        );
    }

    protected requestCount(): void {
        this.actionDispatcher.dispatch(
            RequestCodeToClassDiagramAction.create({
                increase: 0
            })
        );
    }
}
