export type FinderFolder = 'documents' | 'photos' | 'archive' | 'notes';
export type FinderFile = {id:string;name:string;kind:string;available:boolean;folder:FinderFolder;onOpen:()=>void};
export type FinderEntry = {id:string;name:string;kind:string;available:boolean;folder?:FinderFolder|'home';file?:FinderFile};

// A file's containing folder is not a navigation target for the file itself.
export function fileEntry(file:FinderFile):FinderEntry {
  return {id:file.id,name:file.name,kind:file.kind,available:file.available,file};
}
export function activateEntry(item:FinderEntry|undefined,navigate:(folder:FinderFolder|'home')=>void){
  if(item?.file)item.file.onOpen();
  else if(item?.folder)navigate(item.folder);
}
