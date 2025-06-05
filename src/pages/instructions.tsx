import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

/**
 * Simple, focused instructions shown once before the adaptive outcome‑ranking task begins.
 *
 * The user has already tagged each outcome as High / Medium / Low priority. This screen
 * explains—in the fewest words possible—how the upcoming ranking questions work.
 */
const OutcomeRankingIntro: React.FC = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/prioritize-1");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-2xl p-6"
    >
      <Card className="rounded-2xl shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-semibold">Outcome Prioritization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5 text-base leading-relaxed">
          <p>
            Luna will now ask a few <strong>hypothetical</strong> questions to understand how you weigh different
            outcomes against one another. Your answers help refine the priorities you set earlier.

            These <strong>may not be realistic</strong> outcome sets - that's ok! 
            Luna is just trying to learn more about what you want.
          </p>

          <ol className="list-decimal list-inside space-y-2">
            <li>You will see <strong>three</strong> cards with hypothetical outcome measurement sets on each page.</li>
            <li>Rearrange the cards to rank them as <em>1st, 2nd,</em> and <em>3rd </em> based on which hypothetical combination you'd prefer.</li>
            <li>Every question focuses on just a <strong>few</strong> outcomes at once.</li>
            <li>Each page will also show your set outcome goals to reference along with the 3 to rank.</li>

          </ol>

          <p>When you’re ready, start the ranking!</p>

          <div className="flex justify-end">
            <Button size="lg" onClick={handleStart} className="px-6 py-2 text-lg font-medium">
              Start Ranking
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OutcomeRankingIntro;
