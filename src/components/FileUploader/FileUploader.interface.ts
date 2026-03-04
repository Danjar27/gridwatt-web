export interface FileUploaderProps {
    /** Currently staged files */
    files: Array<File>;

    /** Whether a drag operation is currently active over the drop zone */
    isDragging: boolean;

    /** Called when new files should be added to the list */
    onAdd: (files: Array<File>) => void;

    /** Called when a file should be removed from the list by its name */
    onRemove: (name: string) => void;

    /** Called when a drag event moves over the drop zone */
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;

    /** Called when a drag event leaves the drop zone */
    onDragLeave: () => void;

    /** Called when files are dropped onto the drop zone */
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}
