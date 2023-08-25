import { Group } from './parsed_types';
import { ChunkView } from './ChunkView';
import { pathToString, KeyPath } from './rendering_utils';

interface GroupProps extends KeyPath {
  group: Group;
}

export function GroupView({ group, path, fancy, updateSelection }: GroupProps) {
  if (!group.chunks) {
    return <div>This isn't a group: {`${JSON.stringify(group)}`}</div>;
  }

  return (
    <span
      className={`${
        fancy ? 'border-red-500 border-opacity-50 border-2 rounded-md p-1' : ''
      } text-purple-200 font-bold`}>
      (
      {group.chunks?.map((chunk, idx) => {
        const newPath = [...path, idx];
        return (
          <ChunkView
            chunk={chunk}
            key={pathToString('group', newPath)}
            path={newPath}
            fancy={fancy}
            updateSelection={updateSelection}
          />
        );
      })}
      :{group.weight})
    </span>
  );
}
