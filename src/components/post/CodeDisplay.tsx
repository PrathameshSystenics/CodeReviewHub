"use client";

import {
  addCommentOnPostApi,
  getCommentCountOnPostApi,
  getCommentsOnPostApi,
} from "@/api/comment";
import CodeSnippet from "@/components/CodeSnippet";
import { highlightCodeByLine, type Token } from "@/lib/shiki";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { JetBrains_Mono } from "next/font/google";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "react-toastify";
import CodeLine from "./CodeLine";
import LineCommentPopover from "./Comment/LineCommentPopover";
import LineCommentViewPopover from "./Comment/LineCommentViewPopover";
import { CodeStatus } from "@generated/prisma/enums";

//#region Font Declaration
const jetbrains_mono = JetBrains_Mono({ subsets: ["latin"], weight: "400" });
//#endregion

interface CodeDisplayProps {
  code: string;
  language: string;
  owner: boolean;
  postid: string;
  postStatus: CodeStatus;
  requireComments: boolean;
}

const CodeDisplay = ({
  code,
  language,
  owner,
  postid,
  postStatus,
  requireComments,
}: CodeDisplayProps) => {
  //#region State
  const [lines, setLines] = useState<Token[][] | null>(null);
  const [selectedStart, setSelectedStart] = useState<number | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<number | null>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [viewingCommentsLine, setViewingCommentsLine] = useState<number | null>(
    null,
  );
  const viewingCommentsLineRef = useRef<number | null>(null);
  //#endregion

  // Track if user is currently dragging across line numbers
  const dragging = useRef(false);
  const dragFrom = useRef<number | null>(null);

  const session = useSession();
  const currentUserId = session.data?.user?.id;
  const queryClient = useQueryClient();

  //#region Use Effects
  // Use Effect for Getting the Code by Line
  useEffect(() => {
    let cancelled = false;

    if (code) {
      highlightCodeByLine(code, language).then((tokens) => {
        if (!cancelled) setLines(tokens);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [code, language]);

  const onMouseUp = useEffectEvent(() => {
    if (dragging.current) {
      dragging.current = false;
      setShowPopover(true);
    }
  });

  const prevent = useEffectEvent((e: Event) => {
    if (dragging.current) e.preventDefault();
  });

  // Use Effect for Dragging the Line
  useEffect(() => {
    if (!owner && requireComments) {
      document.addEventListener("mouseup", onMouseUp);
      document.addEventListener("selectstart", prevent);
    }
    return () => {
      if (!owner && requireComments) {
        document.removeEventListener("selectstart", prevent);
        document.removeEventListener("mouseup", onMouseUp);
      }
    };
  }, [requireComments]);
  //#endregion

  const onLineMouseDown = useCallback(
    (line: number) => {
      if (!owner && requireComments) {
        dragging.current = true;
        dragFrom.current = line;
        setSelectedStart(line);
        setSelectedEnd(line);
        setShowPopover(false);
        setViewingCommentsLine(null);
      }
    },
    [owner, requireComments],
  );

  const onLineMouseEnter = useCallback((line: number) => {
    if (!dragging.current || dragFrom.current === null) return;
    setSelectedStart(Math.min(dragFrom.current, line));
    setSelectedEnd(Math.max(dragFrom.current, line));
  }, []);

  const onAddComment = useCallback((line: number) => {
    setSelectedStart(line);
    setSelectedEnd(line);
    setShowPopover(true);
    setViewingCommentsLine(null);
  }, []);

  const closePopover = useCallback(() => {
    setShowPopover(false);
    setSelectedStart(null);
    setSelectedEnd(null);
  }, []);

  const closeViewPopover = useCallback(() => {
    viewingCommentsLineRef.current = null;
    setViewingCommentsLine(null);
  }, []);

  // Submit the comment
  const submitComment = useCallback(
    (startLine: number, endLine: number, content: string) => {
      // api call for adding the comment on the post
      addCommentOnPostApi(postid, {
        startline: startLine,
        content: content,
        endline: endLine,
      }).then((response) => {
        if (response.status === "error") {
          toast.error(response.message);
        } else {
          toast.success("Comment added");
          queryClient.invalidateQueries({ queryKey: ["comments", postid] });
        }
      });

      closePopover();
    },
    [closePopover, postid, queryClient],
  );

  // View comments on a line
  const onViewComments = useCallback(
    (line: number) => {
      if (viewingCommentsLineRef.current === line) {
        closeViewPopover();
        return;
      }
      viewingCommentsLineRef.current = line;
      setShowPopover((prev) => (prev ? false : prev));
      setSelectedStart((prev) => (prev !== null ? null : prev));
      setSelectedEnd((prev) => (prev !== null ? null : prev));
      setViewingCommentsLine(line);
    },
    [closeViewPopover],
  );

  const isSelected = (line: number) => {
    if (!requireComments) return false;
    if (selectedStart === null || selectedEnd === null) return false;
    return line >= selectedStart && line <= selectedEnd;
  };

  //#region React Query – fetch comments for the viewed line
  const { data: viewingCommentsResponse, isLoading: viewingCommentsLoading } =
    useQuery({
      queryKey: ["view-comments", postid, viewingCommentsLine],
      queryFn: () => getCommentsOnPostApi(postid, viewingCommentsLine!),
      enabled: viewingCommentsLine !== null,
    });

  const viewingComments = useMemo(
    () => viewingCommentsResponse?.data ?? [],
    [viewingCommentsResponse?.data],
  );

  // Derive the highlight range from fetched comments
  const viewingCommentsRange = useMemo(() => {
    if (!viewingCommentsLine || viewingComments.length === 0) return null;
    let minStart = viewingCommentsLine;
    let maxEnd = viewingCommentsLine;
    for (const c of viewingComments) {
      if (c.startlineno! < minStart) minStart = c.startlineno!;
      if (c.endlineno && c.endlineno > maxEnd) maxEnd = c.endlineno;
    }
    return { start: minStart, end: maxEnd };
  }, [viewingCommentsLine, viewingComments]);
  //#endregion

  const isHighlighted = (line: number) => {
    if (!viewingCommentsRange) return false;
    return (
      line >= viewingCommentsRange.start && line <= viewingCommentsRange.end
    );
  };

  const plainLines = code.split("\n");

  //#region React Query Fetch Comment Count
  const { data: commentsCountResponse } = useQuery({
    queryKey: ["comments", postid],
    queryFn: () => getCommentCountOnPostApi(postid),
    enabled: requireComments,
  });
  //#endregion

  return (
    <CodeSnippet title={language}>
      <div className="overflow-x-auto -mx-4 -mb-4 custom-scrollbar">
        {lines
          ? lines.map((tokens, i) => {
              const lineNum = i + 1;
              const commentCount =
                commentsCountResponse?.data?.find(
                  (value) => value.startlineno === lineNum,
                )?.count ?? 0;

              return (
                <div key={i}>
                  <CodeLine
                    lineNumber={lineNum}
                    tokens={tokens}
                    owner={owner}
                    showCommentButton={requireComments}
                    isSelected={isSelected(lineNum)}
                    isHighlighted={isHighlighted(lineNum)}
                    commentCount={commentCount}
                    onLineMouseDown={onLineMouseDown}
                    onLineMouseEnter={onLineMouseEnter}
                    onAddComment={onAddComment}
                    onViewComments={onViewComments}
                  />

                  {/* Show add-comment popover right below the last selected line */}
                  {requireComments &&
                    !owner &&
                    showPopover &&
                    selectedEnd === lineNum &&
                    selectedStart !== null && (
                      <LineCommentPopover
                        startLine={selectedStart}
                        endLine={selectedEnd}
                        onClose={closePopover}
                        onSubmit={submitComment}
                      />
                    )}

                  {/* Show view-comments popover below the clicked line */}
                  {viewingCommentsLine !== null &&
                    viewingCommentsLine === lineNum && (
                      <LineCommentViewPopover
                        postId={postid}
                        lineNumber={lineNum}
                        postStatus={postStatus}
                        comments={viewingComments}
                        currentUserId={currentUserId}
                        loading={viewingCommentsLoading}
                        onClose={closeViewPopover}
                      />
                    )}
                </div>
              );
            })
          : plainLines.map((line, i) => (
              <div
                key={i}
                className={`${jetbrains_mono.className} flex items-stretch`}
              >
                <div className="w-13 shrink-0 flex items-center justify-end pr-2 select-none text-slate-600 text-xs border-r border-slate-700/30">
                  {i + 1}
                </div>
                <div className="w-9 shrink-0" />
                <div className="flex-1 px-3 py-px whitespace-pre">
                  <span className="text-sm leading-6 text-slate-300">
                    {line || "\n"}
                  </span>
                </div>
              </div>
            ))}
      </div>
    </CodeSnippet>
  );
};

export default CodeDisplay;
