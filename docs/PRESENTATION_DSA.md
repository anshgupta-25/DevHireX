# 🧠 Project Analysis: DSA Implementation

This document provides an analysis of the **Data Structures and Algorithms (DSA)** used in the application. This is essential for project viva and technical discussions.

---

## 🔍 1. Search & Filtering Logic (Algorithms)

### Job Search (Regex Searching)
Our job search engine utilizes a **Regular Expression-based pattern matching** algorithm within MongoDB ($regex).
-   **Mechanism:** Case-insensitive prefix/substring match.
-   **Complexity:** $O(n)$ where $n$ is the number of jobs.
-   **Optimization:** In a production environment, this could be optimized using **Text Indexing** or **ElasticSearch** for $O(\log n)$ performance.

### Skill-Based Filtering
We implement **Set-based filtering** for job requirements.
-   **Data Structure:** Array/List of skills.
-   **Operator:** `$in` operator in Mongoose performs an intersection-like check.
-   **Complexity:** $O(k)$ where $k$ is the number of skills being filtered.

---

## 💬 2. Messaging System (Data Structures)

The chat system employs advanced data structures for grouping and sorting:

### Grouping Contacts (Hash Map)
In the `messageController`, we use a **Map (Hash Table)** data structure to group messages by contact.
-   **Why:** For efficient $O(1)$ lookups and updates while iterating through the message list.
-   **Logic:**
    -   Iterate through all messages ($O(m)$ where $m$ is message count).
    -   Store the latest message for each unique user in the Map.
    -   Calculate unread counts on-the-fly.

### Sorting Conversations (Sorting Algorithm)
Conversations are sorted by the "Last Message Recency."
-   **Algorithm:** JavaScript's `.sort()` method, which typically uses **Timsort** (hybrid of Merge Sort and Insertion Sort).
-   **Complexity:** $O(u \log u)$ where $u$ is the number of unique user contacts.

---

## 📊 3. Core Data Structures Used

| Structure | Usage Case | Benefit |
| :--- | :--- | :--- |
| **Arrays** | Job Skills, Applicants List | Simple $O(1)$ access for sequential data. |
| **Hash Maps** | Contact Grouping, Auth Context | Fast $O(1)$ retrieval of complex objects. |
| **Stacks (LIFO)** | Job Postings (Newest first) | Recent data is prioritized. |
| **Queues (FIFO)** | Chat History (Read order) | Preserves chronological order. |
| **B-Tree Indexes** | MongoDB `_id` and unique fields | Enables fast $O(\log n)$ retrieval by ID. |

---

## 🛠️ 4. Performance Optimizations

1.  **Compound Indexing:** Implemented in the `Application` model `(userId: 1, jobId: 1)` to ensure $O(1)$ check for duplicate applications.
2.  **Pagination/Limit:** Used in the `Job` retrieval algorithm to keep memory usage constant regardless of database size.
3.  **Real-Time Pushing:** Instead of "Polling" (which is $O(n \cdot f)$ where $f$ is frequency), we use "Push" (WebSockets) to update only the affected user ($O(1)$ per event).

---

## 🎓 Potential Viva Questions (DSA)

1.  **What is the Time Complexity of your search feature?**
    -   It is $O(n)$ for a regex-based scan.
2.  **Why use a Map for grouping messages?**
    -   Because it allows us to group messages by User ID in one pass ($O(n)$), providing $O(1)$ access for each unique user encountered.
3.  **Which sorting algorithm does JavaScript use for `.sort()`?**
    -   Modern engines like V8 use **Timsort**, which is highly efficient for real-world sorted data ($O(n \log n)$).
