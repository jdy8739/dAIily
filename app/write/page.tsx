import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";
import Button from "../../components/atoms/button";
import Input from "../../components/atoms/input";
import Textarea from "../../components/atoms/textarea";

const WritePage = async () => {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
              Share Your Daily Growth
            </h1>

            <form className="space-y-6">
              <Input
                type="text"
                name="title"
                label="Title"
                placeholder="What did you accomplish today?"
                className="px-4 py-3"
              />

              <Textarea
                name="content"
                label="Content"
                rows={12}
                placeholder="Share your experiences, learnings, and achievements from today..."
                className="px-4 py-3"
              />

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center space-x-4">
                  <Button type="button" variant="outline">
                    Save Draft
                  </Button>

                  <Button type="button" variant="ai">
                    ✨ AI Correct
                  </Button>
                </div>

                <Button type="submit" variant="primary" size="lg">
                  Share Growth
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WritePage;
