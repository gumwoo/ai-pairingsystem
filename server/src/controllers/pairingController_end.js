 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' });
    }
    
    const updatedPairing = await Pairing.updateRating(pairingId, rating);
    
    return res.json({
      success: true,
      data: updatedPairing
    });
    
  } catch (error) {
    console.error('Error in rate pairing controller:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};