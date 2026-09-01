import type { FurnitureItem } from '@entities/scene'
import { useFurnitureMaterials } from '../../lib/furniture/FurnitureMaterials'
import { BedModel } from './models/BedroomModels'
import { BooksModel, PhotoFrameModel, PlantModel, VaseModel } from './models/DecorModels'
import { CeilingLampModel, TableLampModel, WallLampModel } from './models/LampModels'
import { RugModel } from './models/RugModel'
import { ArmchairModel, BenchModel, ChairModel, SofaModel } from './models/SeatingModels'
import { BookshelfModel, CabinetModel, WardrobeModel } from './models/StorageModels'
import { CoffeeTableModel, DeskModel, DiningTableModel } from './models/TableModels'
import { MirrorModel, PaintingModel, ShelfModel, WallClockModel, WallTvModel } from './models/WallModels'

interface Props {
  item: FurnitureItem
}

export function ProceduralFurniture({ item }: Props) {
  const materials = useFurnitureMaterials(item)
  const props = { item, materials }

  switch (item.kind) {
    case 'sofa':
      return <SofaModel {...props} />
    case 'armchair':
      return <ArmchairModel {...props} />
    case 'desk':
      return <DeskModel {...props} />
    case 'bed':
      return <BedModel {...props} />
    case 'cabinet':
      return <CabinetModel {...props} />
    case 'bookshelf':
      return <BookshelfModel {...props} />
    case 'wardrobe':
      return <WardrobeModel {...props} />
    case 'table':
      return <DiningTableModel {...props} />
    case 'coffee-table':
      return <CoffeeTableModel {...props} />
    case 'chair':
      return <ChairModel {...props} />
    case 'bench':
      return <BenchModel {...props} />
    case 'rug':
      return <RugModel {...props} />
    case 'vase':
      return <VaseModel {...props} />
    case 'photo-frame':
      return <PhotoFrameModel {...props} />
    case 'plant':
      return <PlantModel {...props} />
    case 'table-lamp':
      return <TableLampModel {...props} />
    case 'books':
      return <BooksModel {...props} />
    case 'shelf':
      return <ShelfModel {...props} />
    case 'painting':
      return <PaintingModel {...props} />
    case 'mirror':
      return <MirrorModel {...props} />
    case 'wall-clock':
      return <WallClockModel {...props} />
    case 'wall-tv':
      return <WallTvModel {...props} />
    case 'wall-lamp':
      return <WallLampModel {...props} />
    case 'ceiling-lamp':
      return <CeilingLampModel {...props} />
  }
}
