import { MenuEntity, MenuTreeDto } from '../types/entity'

export interface Tree {
  id: number
  label: string
  children?: Tree[]
}

export const filterMenuTree = (
  menus: MenuTreeDto[],
  parent_id: number
): Tree[] => {
  const data: Tree[] = []
  menus
    .filter((item) => item.parent_id === parent_id)
    .forEach((item) => {
      data.push({
        id: item.menu_id as number,
        label: item.menu_title as string,
        children: item.children
          ? filterMenuTree(item.children, item.menu_id as number)
          : []
      })
    })
  return data
}
export const filterMenuKey = (menus: MenuEntity[]): number[] => {
  const data: number[] = []
  menus.forEach((item) => data.push(item.menu_id as number))
  return data
}
