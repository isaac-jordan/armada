import { useCallback, useMemo } from "react"

import { Checkbox } from "@mui/material"
import { ColumnDef, createColumnHelper, VisibilityState } from "@tanstack/table-core"
import { EnumFilterOption } from "components/lookoutV2/JobsTableFilter"
import { JobTableRow } from "models/jobsTableModels"
import { JobState } from "models/lookoutV2Models"

import { formatBytes, formatCPU, formatJobState, formatTimeSince, formatUtcDate } from "./jobsTableFormatters"

export type JobTableColumn = ColumnDef<JobTableRow, any>

export enum FilterType {
  Text = "Text",
  Enum = "Enum",
}

export interface JobTableColumnMetadata {
  displayName: string
  isRightAligned?: boolean
  filterType?: FilterType
  enumFitlerValues?: EnumFilterOption[]
  isAnnotation?: boolean
}

export enum StandardColumnId {
  JobID = "jobId",
  Queue = "queue",
  JobSet = "jobSet",
  State = "state",
  Priority = "priority",
  Owner = "owner",
  CPU = "cpu",
  Memory = "memory",
  GPU = "gpu",
  TimeSubmittedUtc = "timeSubmittedUtc",
  TimeSubmittedAgo = "timeSubmittedAgo",
  LastTransitionTimeUtc = "lastTransitionTimeUtc",
  TimeInState = "timeInState",
  SelectorCol = "selectorCol",
}

export type AnnotationColumnId = `annotation_${string}`

export type ColumnId = StandardColumnId | AnnotationColumnId

export const toColId = (columnId: string | undefined) => columnId as ColumnId

export const getColumnMetadata = (column: JobTableColumn) => (column.meta ?? {}) as JobTableColumnMetadata

const columnHelper = createColumnHelper<JobTableRow>()

interface AccessorColumnHelperArgs {
  id: ColumnId
  accessor: Parameters<typeof columnHelper.accessor>[0]
  displayName: string
  additionalOptions?: Partial<Parameters<typeof columnHelper.accessor>[1]>
  additionalMetadata?: Partial<JobTableColumnMetadata>
}
const accessorColumn = ({
  id,
  accessor,
  displayName,
  additionalOptions,
  additionalMetadata,
}: AccessorColumnHelperArgs) => {
  return columnHelper.accessor(accessor, {
    id: id,
    header: displayName,
    enableHiding: true,
    enableSorting: false,
    size: 70,
    ...additionalOptions,
    meta: {
      displayName: displayName,
      ...additionalMetadata,
    } as JobTableColumnMetadata,
  })
}

// Columns will appear in this order by default
export const JOB_COLUMNS: JobTableColumn[] = [
  columnHelper.display({
    id: StandardColumnId.SelectorCol,
    size: 35,
    aggregatedCell: undefined,
    enableColumnFilter: false,
    enableSorting: false,
    enableHiding: false,
    header: ({ table }): JSX.Element => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        indeterminate={table.getIsSomeRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        size="small"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsGrouped() ? row.getIsAllSubRowsSelected() : row.getIsSelected()}
        indeterminate={row.getIsSomeSelected()}
        onChange={useCallback(row.getToggleSelectedHandler(), [row])}
        size="small"
        sx={useMemo(
          () => ({
            marginLeft: `${row.depth * 6}px`,
          }),
          [],
        )}
      />
    ),
    meta: {
      displayName: "Select Column",
    } as JobTableColumnMetadata,
  }),
  accessorColumn({
    id: StandardColumnId.Queue,
    accessor: "queue",
    displayName: "Queue",
    additionalOptions: {
      enableGrouping: true,
      enableColumnFilter: true,
      size: 120,
    },
    additionalMetadata: {
      filterType: FilterType.Text,
    },
  }),
  accessorColumn({
    id: StandardColumnId.JobSet,
    accessor: "jobSet",
    displayName: "Job Set",
    additionalOptions: {
      enableGrouping: true,
      enableColumnFilter: true,
      size: 120,
    },
    additionalMetadata: {
      filterType: FilterType.Text,
    },
  }),
  accessorColumn({
    id: StandardColumnId.JobID,
    accessor: "jobId",
    displayName: "Job ID",
    additionalOptions: {
      enableColumnFilter: true,
      enableSorting: true,
      size: 120,
    },
    additionalMetadata: {
      filterType: FilterType.Text,
    },
  }),
  accessorColumn({
    id: StandardColumnId.State,
    accessor: (jobTableRow) => formatJobState(jobTableRow.state),
    displayName: "State",
    additionalOptions: {
      enableGrouping: true,
      enableColumnFilter: true,
      size: 70,
    },
    additionalMetadata: {
      filterType: FilterType.Enum,
      enumFitlerValues: Object.values(JobState).map((state) => ({
        value: state,
        displayName: formatJobState(state),
      })),
    },
  }),
  accessorColumn({
    id: StandardColumnId.Priority,
    accessor: "priority",
    displayName: "Priority",
  }),
  accessorColumn({
    id: StandardColumnId.Owner,
    accessor: "owner",
    displayName: "Owner",
  }),
  accessorColumn({
    id: StandardColumnId.CPU,
    accessor: (jobTableRow) => formatCPU(jobTableRow.cpu),
    displayName: "CPUs",
  }),
  accessorColumn({
    id: StandardColumnId.Memory,
    accessor: (jobTableRow) => formatBytes(jobTableRow.memory),
    displayName: "Memory",
  }),
  accessorColumn({
    id: StandardColumnId.GPU,
    accessor: "gpu",
    displayName: "GPUs",
  }),
  accessorColumn({
    id: StandardColumnId.LastTransitionTimeUtc,
    accessor: (jobTableRow) => formatUtcDate(jobTableRow.lastTransitionTime),
    displayName: "Last State Change (UTC)",
  }),
  accessorColumn({
    id: StandardColumnId.TimeInState,
    accessor: (jobTableRow) => formatTimeSince(jobTableRow.lastTransitionTime),
    displayName: "Time In State",
  }),
  accessorColumn({
    id: StandardColumnId.TimeSubmittedUtc,
    accessor: (jobTableRow) => formatUtcDate(jobTableRow.submitted),
    displayName: "Time Submitted (UTC)",
  }),
  accessorColumn({
    id: StandardColumnId.TimeSubmittedAgo,
    accessor: (jobTableRow) => formatTimeSince(jobTableRow.submitted),
    displayName: "Time Since Submitted",
  }),
]

export const DEFAULT_COLUMNS_TO_DISPLAY: Set<ColumnId> = new Set([
  StandardColumnId.SelectorCol,
  StandardColumnId.Queue,
  StandardColumnId.JobSet,
  StandardColumnId.JobID,
  StandardColumnId.State,
  StandardColumnId.TimeInState,
  StandardColumnId.TimeSubmittedUtc,
])

export const DEFAULT_COLUMN_VISIBILITY: VisibilityState = Object.values(StandardColumnId).reduce<VisibilityState>(
  (state, colId) => {
    state[colId] = DEFAULT_COLUMNS_TO_DISPLAY.has(colId)
    return state
  },
  {},
)

export const DEFAULT_GROUPING: ColumnId[] = [StandardColumnId.Queue, StandardColumnId.JobSet]

export const createAnnotationColumn = (annotationKey: string): JobTableColumn => {
  return accessorColumn({
    id: `annotation_${annotationKey}`,
    accessor: (jobTableRow) => jobTableRow.annotations?.[annotationKey],
    displayName: annotationKey,
    additionalMetadata: {
      isAnnotation: true,
    },
  })
}
