/*********************************************************************************
 * Copyright (c) 2023 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 *********************************************************************************/

import { Action, RequestAction, type ResponseAction } from '@eclipse-glsp/protocol';

// ========= This action will be handled by the GLSP Client =========

export interface RequestCodeToClassDiagramAction extends RequestAction<CodeToClassDiagramActionResponse> {
    kind: typeof RequestCodeToClassDiagramAction.KIND;
    increase: number;
}

export namespace RequestCodeToClassDiagramAction {
    export const KIND = 'requestCodeToClassDiagram';

    export function is(object: unknown): object is RequestCodeToClassDiagramAction {
        return RequestAction.hasKind(object, KIND);
    }

    export function create(options: Omit<RequestCodeToClassDiagramAction, 'kind' | 'requestId'>): RequestCodeToClassDiagramAction {
        return {
            kind: KIND,
            requestId: '',
            ...options
        };
    }
}

export interface CodeToClassDiagramActionResponse extends ResponseAction {
    kind: typeof CodeToClassDiagramActionResponse.KIND;
    count: number;
}
export namespace CodeToClassDiagramActionResponse {
    export const KIND = 'codeToClassDiagramResponse';

    export function is(object: unknown): object is CodeToClassDiagramActionResponse {
        return Action.hasKind(object, KIND);
    }

    export function create(
        options?: Omit<CodeToClassDiagramActionResponse, 'kind' | 'responseId'> & { responseId?: string }
    ): CodeToClassDiagramActionResponse {
        return {
            kind: KIND,
            responseId: '',
            count: 0,
            ...options
        };
    }
}

export interface RequestSelectFolderAction extends RequestAction<SelectedFolderResponseAction> {
    kind: typeof RequestSelectFolderAction.KIND;
}

export namespace RequestSelectFolderAction {
    export const KIND = 'requestSelectFolder';

    export function is(object: unknown): object is RequestSelectFolderAction {
        return RequestAction.hasKind(object, KIND);
    }

    export function create(): RequestSelectFolderAction {
        return {
            kind: KIND,
            requestId: ''
        };
    }
}

export interface SelectedFolderResponseAction extends ResponseAction {
    kind: typeof SelectedFolderResponseAction.KIND;
    folderPath: string | null;
}

export namespace SelectedFolderResponseAction {
    export const KIND = 'selectedFolderResponse';

    export function is(object: unknown): object is SelectedFolderResponseAction {
        return Action.hasKind(object, KIND);
    }

    export function create(
        options?: Omit<SelectedFolderResponseAction, 'kind' | 'responseId'> & { responseId?: string }
    ): SelectedFolderResponseAction {
        return {
            kind: KIND,
            responseId: '',
            folderPath: null,
            ...options
        };
    }
}

// export interface InitClientHandshakeAction extends RequestAction<InitClientHandshakeResponse> {
//     kind: typeof InitClientHandshakeAction.KIND;
// }

// export namespace InitClientHandshakeAction {
//     export const KIND = 'initClientHandshake';

//     export function is(object: unknown): object is InitClientHandshakeAction {
//         return RequestAction.hasKind(object, KIND);
//     }

//     export function create(): InitClientHandshakeAction {
//         return {
//             kind: KIND,
//             requestId: ''
//         };
//     }
// }

// export interface InitClientHandshakeResponse extends ResponseAction {
//     kind: typeof InitClientHandshakeResponse.KIND;
// }

// export namespace InitClientHandshakeResponse {
//     export const KIND = 'initClientHandshakeResponse';

//     export function is(object: unknown): object is InitClientHandshakeResponse {
//         return Action.hasKind(object, KIND);
//     }

//     export function create(): InitClientHandshakeResponse {
//         return {
//             kind: KIND,
//             responseId: ''
//         };
//     }
// }
