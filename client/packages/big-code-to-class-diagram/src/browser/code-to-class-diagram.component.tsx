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
import { RequestSelectFolderAction, SelectedFolderResponseAction } from '../common/code-to-class-diagram.action.js';

export function CodeToClassDiagram(): ReactElement {
    const { listenAction, dispatchAction } = useContext(VSCodeContext);
    const [folder, setFolder] = useState<string | null>(null);

    useEffect(() => {
        listenAction(action => {
            if (SelectedFolderResponseAction.is(action)) {
                console.log("Action received");
                setFolder(action.folderPath);
                console.log("Folder set: ", action.folderPath);
            }
        })
    })

    // const openFile = () => {
    //     console.log("Import File was Pressed!")
    // };

    const openFile = useCallback(() => {
        console.log("Import File was Pressed!")
        dispatchAction(RequestSelectFolderAction.create());
        console.log("Action dispatched")
    }, [dispatchAction]);

    return (
        <div>
            <span>CODE TO CLASS DIAGRAM!</span>
            <span>Selected Folder: {folder}</span>
            <button onClick={() => openFile()}>Import File</button>
        </div>
    );
}
