/**********************************************************************************
 * Copyright (c) 2025 borkdominik and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the MIT License which is available at https://opensource.org/licenses/MIT.
 *
 * SPDX-License-Identifier: MIT
 **********************************************************************************/
import { VSCodeContext } from '@borkdominik-biguml/big-components';
import { useCallback, useContext, useEffect, useState, type ReactElement } from 'react';
import { GenerateDiagramRequestAction, RequestSelectFolderAction, SelectedFolderResponseAction } from '../common/code-to-class-diagram.action.js';

export function CodeToClassDiagram(): ReactElement {
    const { listenAction, dispatchAction } = useContext(VSCodeContext);
    const [folder, setFolder] = useState<string | null>(null);
    const [javaFileCount, setJavaFileCount] = useState<number | null>(null);

    useEffect(() => {
        listenAction(action => {
            console.log("ACTION", action)
            if (SelectedFolderResponseAction.is(action)) {
                console.log("Action received");
                setFolder(action.folderPath);
                setJavaFileCount(action.javaFileCount);
                console.log("Folder set: ", action.folderPath);
                console.log("Number of Classes: ", action.javaFileCount);
            }
        });
    }, [listenAction]);

    const openFile = useCallback(() => {
        console.log("Import File was Pressed!")
        dispatchAction(RequestSelectFolderAction.create());
        console.log("Action dispatched: import file")
    }, [dispatchAction]);

    const generateDiagram = useCallback(() => {
        console.log("Generate diagram button was Pressed!")
        dispatchAction(GenerateDiagramRequestAction.create());
        console.log("Action dispatched: generate diagram")
    }, [dispatchAction]);

    return (
        <div>
            <span>CODE TO CLASS DIAGRAM!</span>
            <span>Selected Folder: {folder}</span>
            <span>Files used for file generation: {javaFileCount}</span>
            <button onClick={() => openFile()}>Import File</button>
            <button onClick={() => generateDiagram()}>Generate Diagram</button>
        </div>
    );
}
