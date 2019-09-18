import Meetup from '../models/Meetup';
import User from '../models/User';
import Subscribe from '../models/Subscription';

class SubscribeController {
  async store(req, res) {
    const user = await User.findByPk(req.userId);
    const meetup = await Meetup.findByPk(req.params.meetupId);

    if (meetup.creator_id === req.userId) {
      return res
        .status(400)
        .json({ error: 'Você não pode se inscrever nos seus meetups' });
    }

    if (meetup.past) {
      return res
        .status(400)
        .json({ error: 'Não pode se inscrever em meetups que ja passaram' });
    }

    const checkDate = await Subscribe.findOne({
      where: {
        user_id: user.id,
      },
      include: [
        {
          model: Meetup,
          required: true,
          where: {
            date: meetup.date,
          },
        },
      ],
    });

    if (checkDate) {
      return res.status(400).json({
        error: 'Você não pode se inscrever em dois meetups no mesmo horário',
      });
    }

    const subscription = await Subscribe.create({
      user_id: user.id,
      meetup_id: meetup.id,
    });

    return res.json(subscription);
  }
}

export default new SubscribeController();