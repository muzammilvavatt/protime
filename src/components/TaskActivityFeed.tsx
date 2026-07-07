"use client";

import React, { useRef, useEffect } from "react";
import { MessageSquare, Info, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addTaskCommentAction } from "@/actions/task.actions";

type Activity = {
  id: string;
  action: string;
  details: string | null;
  createdAt: Date;
  user: {
    name: string;
  };
};

export function TaskActivityFeed({ taskId, activities }: { taskId: string, activities: Activity[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activities]);

  return (
    <div className="flex flex-col h-[500px] bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center">
        <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
        <h3 className="font-bold text-slate-800">Activity & Comments</h3>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50"
      >
        {activities.length === 0 ? (
          <div className="text-center text-sm text-slate-500 py-10">
            No activity yet. Be the first to comment!
          </div>
        ) : (
          activities.map((activity) => {
            const isComment = activity.action === "COMMENT";
            
            if (isComment) {
              return (
                <div key={activity.id} className="flex flex-col space-y-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-xs font-bold text-slate-700">{activity.user.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="bg-white border border-slate-200 text-slate-700 text-sm p-3 rounded-tr-xl rounded-b-xl shadow-sm w-fit max-w-[90%]">
                    {activity.details}
                  </div>
                </div>
              );
            } else {
              return (
                <div key={activity.id} className="flex items-center justify-center my-4">
                  <div className="bg-slate-100 border border-slate-200 px-3 py-1 rounded-full text-xs text-slate-500 flex items-center shadow-sm">
                    <Info className="w-3 h-3 mr-1.5 text-slate-400" />
                    <span className="font-semibold text-slate-600 mr-1">{activity.user.name}</span>
                    {activity.details?.toLowerCase()}
                    <span className="ml-2 text-[10px] text-slate-400">
                      {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            }
          })
        )}
      </div>

      <div className="p-3 bg-white border-t border-slate-100">
        <form 
          ref={formRef}
          action={async (formData) => {
            await addTaskCommentAction(taskId, formData);
            formRef.current?.reset();
          }} 
          className="flex items-center space-x-2"
        >
          <input 
            type="text" 
            name="text"
            required
            placeholder="Type a comment..."
            className="flex-1 h-10 px-4 rounded-full border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 bg-slate-50"
          />
          <Button type="submit" size="icon" className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700 shadow-sm shrink-0">
            <Send className="w-4 h-4 text-white" />
          </Button>
        </form>
      </div>
    </div>
  );
}
