// 🎸💀 TIMELINE GRAPHQL QUERIES - IANARKALENDAR TIMELINE REVOLUTION
/**
 * Timeline GraphQL Queries - Advanced Timeline Data Management
 *
 * 🎯 MISSION: Power the most advanced document timeline in medical history
 * ✅ Chronological document queries
 * ✅ Timeline position management
 * ✅ Advanced filtering and search
 * ✅ Real-time timeline updates
 * ✅ Drag & drop position tracking
 */

// 🎯 TIMELINE DOCUMENTS QUERY
export const TIMELINE_DOCUMENTS = `
  query GetTimelineDocuments(
    $patientId: ID
    $isGlobalMode: Boolean!
    $timeScale: String!
    $currentDate: String!
    $filterTags: [String!]
    $filterCategories: [String!]
    $searchQuery: String
  ) {
    timelineDocuments(
      patientId: $patientId
      isGlobalMode: $isGlobalMode
      timeScale: $timeScale
      currentDate: $currentDate
      filterTags: $filterTags
      filterCategories: $filterCategories
      searchQuery: $searchQuery
    ) {
      id
      title
      type
      category
      createdAt
      updatedAt
      patientName
      tags
      aiConfidence
      timelinePosition {
        x
        y
        lane
      }
      status
      fileSize
      fileType
      thumbnailUrl
      metadata {
        key
        value
      }
    }
  }
`;

// 🎯 UPDATE TIMELINE POSITION MUTATION
export const UPDATE_TIMELINE_POSITION = `
  mutation UpdateTimelinePosition(
    $documentId: ID!
    $position: TimelinePositionInput!
  ) {
    updateTimelinePosition(
      documentId: $documentId
      position: $position
    ) {
      success
      message
      document {
        id
        timelinePosition {
          x
          y
          lane
        }
      }
    }
  }
`;

// 🎯 TIMELINE ANALYTICS QUERY
export const TIMELINE_ANALYTICS = `
  query GetTimelineAnalytics(
    $patientId: ID
    $isGlobalMode: Boolean!
    $timeScale: String!
    $currentDate: String!
    $dateRange: DateRangeInput
  ) {
    timelineAnalytics(
      patientId: $patientId
      isGlobalMode: $isGlobalMode
      timeScale: $timeScale
      currentDate: $currentDate
      dateRange: $dateRange
    ) {
      totalDocuments
      documentsByCategory {
        category
        count
        percentage
      }
      documentsByMonth {
        month
        year
        count
      }
      aiAnalyzedCount
      aiConfidenceAverage
      mostActiveDays {
        date
        count
      }
      timelineEfficiency {
        averageProcessingTime
        successRate
        errorRate
      }
    }
  }
`;

// 🎯 BULK TIMELINE UPDATE MUTATION
export const BULK_UPDATE_TIMELINE_POSITIONS = `
  mutation BulkUpdateTimelinePositions(
    $updates: [TimelinePositionUpdateInput!]!
  ) {
    bulkUpdateTimelinePositions(updates: $updates) {
      success
      message
      updatedDocuments {
        id
        timelinePosition {
          x
          y
          lane
        }
      }
      errors {
        documentId
        error
      }
    }
  }
`;

// 🎯 TIMELINE FILTERS QUERY
export const TIMELINE_FILTERS = `
  query GetTimelineFilters(
    $patientId: ID
    $isGlobalMode: Boolean!
  ) {
    timelineFilters(
      patientId: $patientId
      isGlobalMode: $isGlobalMode
    ) {
      availableTags {
        tag
        count
        color
      }
      availableCategories {
        category
        count
        color
      }
      dateRange {
        minDate
        maxDate
      }
      patientStats {
        totalPatients
        activePatients
        documentsPerPatient
      }
    }
  }
`;

// 🎯 TIMELINE EXPORT QUERY
export const EXPORT_TIMELINE_DATA = `
  query ExportTimelineData(
    $patientId: ID
    $isGlobalMode: Boolean!
    $timeScale: String!
    $currentDate: String!
    $filterTags: [String!]
    $filterCategories: [String!]
    $searchQuery: String
    $exportFormat: String!
  ) {
    exportTimelineData(
      patientId: $patientId
      isGlobalMode: $isGlobalMode
      timeScale: $timeScale
      currentDate: $currentDate
      filterTags: $filterTags
      filterCategories: $filterCategories
      searchQuery: $searchQuery
      exportFormat: $exportFormat
    ) {
      success
      message
      downloadUrl
      fileName
      fileSize
      expiresAt
    }
  }
`;

// 🎯 TIMELINE NOTIFICATIONS SUBSCRIPTION
export const TIMELINE_NOTIFICATIONS = `
  subscription TimelineNotifications(
    $patientId: ID
    $isGlobalMode: Boolean!
  ) {
    timelineNotifications(
      patientId: $patientId
      isGlobalMode: $isGlobalMode
    ) {
      id
      type
      message
      documentId
      patientId
      timestamp
      metadata {
        key
        value
      }
    }
  }
`;

// 🎯 TIMELINE SNAPSHOT QUERY
export const TIMELINE_SNAPSHOT = `
  query GetTimelineSnapshot(
    $patientId: ID
    $isGlobalMode: Boolean!
    $snapshotId: ID
  ) {
    timelineSnapshot(
      patientId: $patientId
      isGlobalMode: $isGlobalMode
      snapshotId: $snapshotId
    ) {
      id
      name
      description
      createdAt
      createdBy
      documents {
        id
        title
        timelinePosition {
          x
          y
          lane
        }
      }
      filters {
        tags
        categories
        dateRange
        searchQuery
      }
    }
  }
`;

// 🎯 SAVE TIMELINE SNAPSHOT MUTATION
export const SAVE_TIMELINE_SNAPSHOT = `
  mutation SaveTimelineSnapshot(
    $name: String!
    $description: String
    $patientId: ID
    $isGlobalMode: Boolean!
    $documents: [TimelineDocumentInput!]!
    $filters: TimelineFiltersInput!
  ) {
    saveTimelineSnapshot(
      name: $name
      description: $description
      patientId: $patientId
      isGlobalMode: $isGlobalMode
      documents: $documents
      filters: $filters
    ) {
      success
      message
      snapshot {
        id
        name
        createdAt
      }
    }
  }
`;

// 🎯 TIMELINE SEARCH SUGGESTIONS
export const TIMELINE_SEARCH_SUGGESTIONS = `
  query GetTimelineSearchSuggestions(
    $patientId: ID
    $isGlobalMode: Boolean!
    $query: String!
    $limit: Int
  ) {
    timelineSearchSuggestions(
      patientId: $patientId
      isGlobalMode: $isGlobalMode
      query: $query
      limit: $limit
    ) {
      suggestions {
        text
        type
        count
        category
      }
      recentSearches {
        query
        timestamp
        resultCount
      }
      popularTags {
        tag
        count
        category
      }
    }
  }
`;
