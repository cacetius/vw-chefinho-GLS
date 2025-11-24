import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Users, Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import FeedbackForm from "../components/feedback/FeedbackForm";
import FeedbackList from "../components/feedback/FeedbackList";

export default function Feedback360() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUser();
    loadFeedbacks();
  }, []);

  const loadUser = async () => {
    const user = await base44.auth.me();
    setCurrentUser(user);
  };

  const loadFeedbacks = async () => {
    const user = await base44.auth.me();
    const data = await base44.entities.Feedback360.filter({ avaliado_id: user.id }, "-created_date");
    setFeedbacks(data);
  };

  const handleSubmit = async (feedbackData) => {
    await base44.entities.Feedback360.create(feedbackData);
    setShowForm(false);
    loadFeedbacks();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-yellow-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#001e50] flex items-center gap-3">
              <Star className="w-8 h-8 text-yellow-500" />
              Feedback 360°
            </h1>
            <p className="text-gray-600 mt-1">Avalie e seja avaliado pela equipe</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-yellow-500 to-yellow-600">
            <Plus className="w-5 h-5 mr-2" />
            Dar Feedback
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="shadow-lg border-l-4 border-l-yellow-500">
            <CardHeader>
              <CardTitle className="text-sm">Feedbacks Recebidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{feedbacks.length}</div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="text-sm">Média de Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {feedbacks.length > 0
                  ? (feedbacks.reduce((acc, f) => {
                      const media = f.criterios?.reduce((sum, c) => sum + c.nota, 0) / (f.criterios?.length || 1);
                      return acc + media;
                    }, 0) / feedbacks.length).toFixed(1)
                  : '0.0'}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-sm">Feedbacks Visualizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {feedbacks.filter(f => f.status === "visualizado").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <AnimatePresence>
          {showForm && (
            <FeedbackForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              currentUser={currentUser}
            />
          )}
        </AnimatePresence>

        <FeedbackList feedbacks={feedbacks} />
      </div>
    </div>
  );
}