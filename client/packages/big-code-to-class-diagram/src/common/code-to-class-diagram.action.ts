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
