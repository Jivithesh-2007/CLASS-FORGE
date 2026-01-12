const calculateSimilarity = (text1, text2) => {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  const jaccardSimilarity = (intersection.size / union.size) * 100;
  
  return Math.round(jaccardSimilarity);
};
const findSimilarIdeas = async (Idea, title, description, excludeId = null) => {
  const allIdeas = await Idea.find({
    _id: { $ne: excludeId },
    status: { $in: ['pending', 'approved'] }
  });
  const similarIdeas = [];
  const combinedText1 = `${title} ${description}`.toLowerCase();
  for (const idea of allIdeas) {
    const combinedText2 = `${idea.title} ${idea.description}`.toLowerCase();
    const score = calculateSimilarity(combinedText1, combinedText2);
    
    if (score > 30) {
      similarIdeas.push({
        idea,
        score
      });
    }
  }
  return similarIdeas.sort((a, b) => b.score - a.score);
};
module.exports = { calculateSimilarity, findSimilarIdeas };